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
 * Imports ready-made question sets (exam → series → tests → questions) from a
 * JSON spec, e.g. backend/database/data/question_sets_aedo.json built by
 * scripts/content/extract-question-sets.js. Idempotent: questions are matched
 * by their normalised text (content_hash), tests by name, series by name.
 *
 *   php artisan osdhyan:import-question-sets database/data/question_sets_aedo.json
 */
class ImportQuestionSets extends Command
{
    protected $signature = 'osdhyan:import-question-sets {file} {--publish=1 : Publish tests and series (1/0)}';

    protected $description = 'Import question sets (exam/series/tests/questions) from a JSON spec';

    public function handle(): int
    {
        $path = $this->argument('file');
        if (!is_file($path)) {
            $path = base_path($path);
        }
        if (!is_file($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }

        $spec = json_decode(file_get_contents($path), true);
        if (!is_array($spec) || empty($spec['exams'])) {
            $this->error('Invalid spec: expected {"exams": [...]}');
            return self::FAILURE;
        }

        $publish = (bool) (int) $this->option('publish');
        $stats = ['questions_new' => 0, 'questions_reused' => 0, 'tests' => 0, 'series' => 0];

        foreach ($spec['exams'] as $examSpec) {
            $exam = $this->importExam($examSpec);
            $this->line("Exam: {$exam->name_en} (#{$exam->id})");

            foreach ($examSpec['series'] as $seriesSpec) {
                $series = TestSeries::firstOrCreate(
                    ['exam_id' => $exam->id, 'name_en' => $seriesSpec['name_en']],
                    [
                        'name_hi'        => $seriesSpec['name_hi'] ?? null,
                        'description_en' => $seriesSpec['description_en'] ?? null,
                        'category'       => $seriesSpec['mode'] ?? 'mock',
                        'is_published'   => $publish,
                        'price'          => 0,
                        'is_paid'        => false,
                    ]
                );
                $stats['series']++;

                $testIds = [];
                foreach ($seriesSpec['tests'] as $i => $testSpec) {
                    $test = DB::transaction(function () use ($exam, $series, $seriesSpec, $testSpec, $publish, &$stats) {
                        return $this->importTest($exam, $series, $seriesSpec, $testSpec, $publish, $stats);
                    });
                    $testIds[] = $test->id;
                    $this->line(sprintf('  %-45s %3d questions', $test->name_en, count($testSpec['questions'])));
                }

                // Keep the series' test order = spec order
                $series->tests()->syncWithoutDetaching($testIds);
                if ($publish && !$series->is_published) {
                    $series->update(['is_published' => true]);
                }
                $stats['tests'] += count($testIds);
            }

            Cache::forget("exam_{$exam->id}_subjects");
            Cache::forget("exam_{$exam->id}_full_v2");
        }
        Cache::forget('exams_list');
        Cache::flush();

        $this->info(sprintf(
            'Done: %d series, %d tests, %d new questions, %d reused.',
            $stats['series'], $stats['tests'], $stats['questions_new'], $stats['questions_reused']
        ));

        return self::SUCCESS;
    }

    private function importExam(array $spec): Exam
    {
        $exam = Exam::where('slug', $spec['slug'])->first()
            ?? Exam::whereRaw('LOWER(name_en) = ?', [strtolower($spec['name_en'])])->first();

        if (!$exam) {
            $exam = Exam::create([
                'name_en' => $spec['name_en'],
                'name_hi' => $spec['name_hi'] ?? null,
                'slug'    => $spec['slug'],
                'code'    => $spec['code'] ?? null,
            ]);
        } elseif (!$exam->code && !empty($spec['code'])) {
            $exam->update(['code' => $spec['code']]);
        }

        return $exam;
    }

    private array $subjectCache = [];

    private function subject(Exam $exam, string $name): Subject
    {
        $key = $exam->id . '|' . mb_strtolower($name);

        return $this->subjectCache[$key] ??= (
            Subject::where('exam_id', $exam->id)->whereRaw('LOWER(name_en) = ?', [mb_strtolower($name)])->first()
            ?? Subject::create([
                'exam_id'      => $exam->id,
                'name_en'      => $name,
                'slug'         => Slug::unique('subjects', ($exam->code ?: $exam->slug) . ' ' . $name, 'subject'),
                'is_published' => true,
            ])
        );
    }

    private function importTest(Exam $exam, TestSeries $series, array $seriesSpec, array $spec, bool $publish, array &$stats): Test
    {
        $subject = $this->subject($exam, $spec['subject'] ?? 'General Studies');
        $negative = (float) ($seriesSpec['negative_marking'] ?? 0.25);

        $test = Test::firstOrCreate(
            ['exam_id' => $exam->id, 'name_en' => $spec['title']],
            [
                'name_hi'          => $spec['title_hi'] ?? $spec['title'],
                'subject_id'       => $subject->id,
                'mode'             => $seriesSpec['mode'] ?? 'mock',
                'category'         => $seriesSpec['mode'] ?? 'mock',
                'status'           => $publish ? 'published' : 'draft',
                'duration_sec'     => (int) ($spec['duration_min'] ?? 60) * 60,
                'question_mark'    => 1,
                'negative_marking' => $negative,
                'total_marks'      => 0,
                'is_free'          => true,
            ]
        );

        $ids = [];
        foreach ($spec['questions'] as $q) {
            $ids[] = $this->importQuestion($exam, $q, $stats);
        }

        $test->replaceQuestions(array_values(array_unique($ids)));
        $test->refreshTotalMarks();
        if ($publish && $test->status !== 'published') {
            $test->update(['status' => 'published']);
        }
        TestPayload::forget($test->id);

        return $test;
    }

    private function importQuestion(Exam $exam, array $q, array &$stats): int
    {
        $textEn = $q['question_en'] ?: $q['question_hi'];
        $hash = Question::fingerprint((string) $textEn);

        $existing = Question::where('content_hash', $hash)->orderBy('id')->first();
        if ($existing) {
            $stats['questions_reused']++;
            // Fill in explanations/Hindi that the earlier copy may lack.
            $fill = array_filter([
                'question_hi'    => $existing->question_hi ?: ($q['question_hi'] ?? null),
                'explanation_en' => $existing->explanation_en ?: ($q['explanation_en'] ?? null),
                'explanation_hi' => $existing->explanation_hi ?: ($q['explanation_hi'] ?? null),
            ]);
            $existing->fill($fill)->save();

            return $existing->id;
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
                'option_en'   => $opt['en'] ?: $opt['hi'],
                'option_hi'   => $opt['hi'] ?? null,
                'is_correct'  => $i === (int) $q['answer_index'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }
        DB::table('question_options')->insert($rows);
        $stats['questions_new']++;

        return $question->id;
    }
}
