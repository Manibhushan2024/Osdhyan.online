<?php

namespace App\Console\Commands;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestSeries;
use App\Services\TestPayload;
use App\Support\Slug;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Imports ready-made question sets (JSON spec from scripts/aedo/extract.js)
 * into exams → subjects → questions → tests → a published test series.
 *
 *   php artisan osdhyan:import-sets database/data/bpsc_aedo_sets.json
 *
 * Idempotent: questions are matched by normalised text (content_hash),
 * tests and series by name, so re-running updates instead of duplicating.
 */
class ImportQuestionSets extends Command
{
    protected $signature = 'osdhyan:import-sets {file : JSON spec path (relative to the backend folder)} {--dry-run : Parse and report only}';

    protected $description = 'Import question sets, tests and a test series from a JSON spec';

    private array $subjectCache = [];

    public function handle(): int
    {
        $path = base_path($this->argument('file'));
        if (!is_file($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }
        $spec = json_decode(file_get_contents($path), true);
        if (!is_array($spec) || empty($spec['exams'])) {
            $this->error('Invalid spec: expected {"exams": [...]}');
            return self::FAILURE;
        }

        $totals = ['questions_new' => 0, 'questions_reused' => 0, 'tests' => 0, 'series' => 0];

        foreach ($spec['exams'] as $examSpec) {
            $exam = Exam::where('slug', $examSpec['match'])
                ->orWhereRaw('LOWER(code) = ?', [strtolower($examSpec['code'] ?? '')])
                ->first();
            if (!$exam) {
                if ($this->option('dry-run')) {
                    $this->line("Would create exam {$examSpec['name_en']}");
                } else {
                    $exam = Exam::create([
                        'name_en' => $examSpec['name_en'],
                        'slug'    => Slug::unique('exams', $examSpec['match'], 'exam'),
                        'code'    => $examSpec['code'] ?? null,
                    ]);
                }
            } elseif (!$this->option('dry-run') && empty($exam->code) && !empty($examSpec['code'])) {
                $exam->update(['code' => $examSpec['code']]);
            }
            $this->info("Exam: {$examSpec['name_en']}" . ($exam ? " (#{$exam->id})" : ''));

            foreach ($examSpec['series'] as $seriesSpec) {
                $questionCount = array_sum(array_map(fn ($t) => count($t['questions']), $seriesSpec['tests']));
                $this->line("  Series: {$seriesSpec['name_en']} — " . count($seriesSpec['tests']) . " tests, {$questionCount} questions");
                if ($this->option('dry-run')) {
                    continue;
                }

                DB::transaction(function () use ($exam, $seriesSpec, &$totals) {
                    $series = TestSeries::firstOrCreate(
                        ['name_en' => $seriesSpec['name_en'], 'exam_id' => $exam->id],
                        [
                            'name_hi'        => $seriesSpec['name_hi'] ?? null,
                            'description_en' => $seriesSpec['description_en'] ?? null,
                            'is_published'   => (bool) ($seriesSpec['is_published'] ?? true),
                            'is_paid'        => (bool) ($seriesSpec['is_paid'] ?? false),
                            'price'          => $seriesSpec['price'] ?? 0,
                        ]
                    );
                    $series->fill(['description_en' => $seriesSpec['description_en'] ?? $series->description_en, 'is_published' => (bool) ($seriesSpec['is_published'] ?? true)])->save();
                    $totals['series']++;

                    $testIds = [];
                    foreach ($seriesSpec['tests'] as $testSpec) {
                        $subject = $this->subject($exam, $testSpec['subject'] ?? 'General Studies');
                        $test = Test::firstOrNew(['name_en' => $testSpec['name_en'], 'exam_id' => $exam->id]);
                        $test->fill([
                            'subject_id'       => $subject->id,
                            'mode'             => $testSpec['mode'] ?? 'mock',
                            'category'         => $testSpec['mode'] ?? 'mock',
                            'status'           => 'published',
                            'duration_sec'     => (int) ($testSpec['duration_min'] ?? 60) * 60,
                            'question_mark'    => $testSpec['question_mark'] ?? 1,
                            'negative_marking' => $testSpec['negative_marking'] ?? 0.25,
                            'total_marks'      => 0,
                        ])->save();

                        $ids = [];
                        foreach ($testSpec['questions'] as $q) {
                            [$id, $new] = $this->importQuestion($exam, $q);
                            $ids[] = $id;
                            $totals[$new ? 'questions_new' : 'questions_reused']++;
                        }
                        $test->replaceQuestions($ids);
                        $test->refreshTotalMarks();
                        $testIds[] = $test->id;
                        $totals['tests']++;
                        $this->line("    ✓ {$test->name_en} (" . count($ids) . ' Q)');
                    }

                    $series->tests()->syncWithoutDetaching($testIds);
                });
            }
        }

        Cache::flush();
        $this->info(sprintf('Done: %d series, %d tests, %d new questions, %d reused.',
            $totals['series'], $totals['tests'], $totals['questions_new'], $totals['questions_reused']));

        return self::SUCCESS;
    }

    private function subject(Exam $exam, string $name): Subject
    {
        $key = $exam->id . '|' . mb_strtolower($name);
        if (!isset($this->subjectCache[$key])) {
            $this->subjectCache[$key] = Subject::where('exam_id', $exam->id)
                ->whereRaw('LOWER(name_en) = ?', [mb_strtolower($name)])->first()
                ?? Subject::create([
                    'exam_id'      => $exam->id,
                    'name_en'      => $name,
                    'slug'         => Slug::unique('subjects', ($exam->code ?: $exam->slug) . ' ' . $name, 'subject'),
                    'is_published' => true,
                ]);
        }

        return $this->subjectCache[$key];
    }

    /** @return array{0:int, 1:bool} question id, created? */
    private function importQuestion(Exam $exam, array $q): array
    {
        $textEn = trim((string) ($q['question_en'] ?: $q['question_hi']));
        $hash = Question::fingerprint($textEn);
        $existing = Question::where('content_hash', $hash)->orderBy('id')->first();
        if ($existing) {
            // Fill in explanations the earlier import may have lacked.
            $existing->fill(array_filter([
                'explanation_en' => $existing->explanation_en ?: ($q['explanation_en'] ?? null),
                'explanation_hi' => $existing->explanation_hi ?: ($q['explanation_hi'] ?? null),
                'question_hi'    => $existing->question_hi ?: ($q['question_hi'] ?? null),
            ]))->save();

            return [$existing->id, false];
        }

        $subject = $this->subject($exam, $q['category'] ?: 'General Studies');
        $question = Question::create([
            'subject_id'     => $subject->id,
            'question_en'    => $textEn,
            'question_hi'    => $q['question_hi'] ?? null,
            'explanation_en' => $q['explanation_en'] ?? null,
            'explanation_hi' => $q['explanation_hi'] ?? null,
            'difficulty'     => 'medium',
        ]);
        $labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        $rows = [];
        foreach ($q['options'] as $i => $opt) {
            $rows[] = [
                'question_id' => $question->id,
                'label'       => $labels[$i] ?? chr(65 + $i),
                'option_en'   => trim((string) ($opt['en'] ?: $opt['hi'])),
                'option_hi'   => $opt['hi'] ?? null,
                'is_correct'  => $i === (int) $q['correct'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }
        DB::table('question_options')->insert($rows);

        return [$question->id, true];
    }
}
