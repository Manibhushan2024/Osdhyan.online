<?php

namespace App\Console\Commands;

use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Question;
use App\Models\StudyMaterial;
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

            if (!empty($examSpec['materials'])) {
                $this->line('  materials: ' . $this->importMaterials($exam, $examSpec['materials']));
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

    private array $chapterCache = [];

    private function chapter(Subject $subject, string $name): Chapter
    {
        $key = $subject->id . '|' . mb_strtolower($name);

        return $this->chapterCache[$key] ??= (
            Chapter::where('subject_id', $subject->id)->whereRaw('LOWER(name_en) = ?', [mb_strtolower($name)])->first()
            ?? Chapter::create([
                'subject_id' => $subject->id,
                'name_en'    => $name,
                'slug'       => Slug::unique('chapters', $subject->name_en . ' ' . $name, 'chapter'),
            ])
        );
    }

    /**
     * Study materials: files already placed under storage/app/public (file_path
     * relative to that disk), linked to subject/chapter by name.
     */
    private function importMaterials(Exam $exam, array $materials): int
    {
        $n = 0;
        foreach ($materials as $m) {
            $subject = $this->subject($exam, $m['subject'] ?? 'General Studies');
            $chapter = !empty($m['chapter']) ? $this->chapter($subject, $m['chapter']) : null;
            StudyMaterial::updateOrCreate(
                ['title' => $m['title'], 'subject_id' => $subject->id],
                [
                    'chapter_id'   => $chapter?->id,
                    'description'  => $m['description'] ?? null,
                    'file_path'    => $m['file_path'],
                    'type'         => $m['type'] ?? 'pdf',
                    'is_published' => true,
                ]
            );
            $n++;
        }

        return $n;
    }

    private function importTest(Exam $exam, TestSeries $series, array $seriesSpec, array $spec, bool $publish, array &$stats): Test
    {
        $subject = $this->subject($exam, $spec['subject'] ?? 'General Studies');
        $negative = (float) ($seriesSpec['negative_marking'] ?? 0.25);

        $chapter = !empty($spec['chapter']) ? $this->chapter($subject, $spec['chapter']) : null;
        $attrs = [
            'name_hi'          => $spec['title_hi'] ?? $spec['title'],
            'description_en'   => $spec['description'] ?? null,
            'subject_id'       => $subject->id,
            'chapter_id'       => $chapter?->id,
            'mode'             => $spec['mode'] ?? $seriesSpec['mode'] ?? 'mock',
            'category'         => $spec['category'] ?? $seriesSpec['category'] ?? $seriesSpec['mode'] ?? 'mock',
            'status'           => $publish ? 'published' : 'draft',
            'duration_sec'     => (int) ($spec['duration_min'] ?? 60) * 60,
            'question_mark'    => (float) ($spec['question_mark'] ?? 1),
            'negative_marking' => (float) ($spec['negative_marking'] ?? $negative),
            'total_marks'      => 0,
            'is_free'          => true,
            'paper_type'       => $spec['paper_type'] ?? null,
            'year'             => $spec['year'] ?? null,
        ];
        $test = Test::firstOrCreate(['exam_id' => $exam->id, 'name_en' => $spec['title']], $attrs);
        if (!$test->wasRecentlyCreated) {
            $test->update(array_intersect_key($attrs, array_flip(['mode', 'category', 'duration_sec', 'negative_marking', 'description_en', 'subject_id', 'chapter_id', 'paper_type', 'year'])));
        }

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
        $textEn = $this->text($q['question_en'] ?? null, $q['question_hi'] ?? null);
        $hash = Question::fingerprint((string) $textEn);

        // Same stem is not enough: generic stems ("select the odd one out") repeat
        // with different options, so an existing row is reused only when its
        // options match too.
        $wanted = array_map(fn ($o) => $this->normOption($this->text($o['en'] ?? null, $o['hi'] ?? null)), $q['options']);
        $existing = Question::where('content_hash', $hash)->orderBy('id')->with('options')->get()
            ->first(fn ($cand) => $cand->options->sortBy('label')->map(fn ($o) => $this->normOption((string) $o->option_en))->values()->all() === $wanted);
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
        $chapter = !empty($q['chapter']) ? $this->chapter($subject, $q['chapter']) : null;
        $question = Question::create([
            'subject_id'     => $subject->id,
            'chapter_id'     => $chapter?->id,
            'question_en'    => $textEn,
            'question_hi'    => $q['question_hi'] ?? null,
            'explanation_en' => $q['explanation_en'] ?? null,
            'explanation_hi' => $q['explanation_hi'] ?? null,
            'difficulty'     => in_array($q['difficulty'] ?? '', ['easy', 'medium', 'hard'], true) ? $q['difficulty'] : 'medium',
        ]);

        $labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        $rows = [];
        foreach ($q['options'] as $i => $opt) {
            $rows[] = [
                'question_id' => $question->id,
                'label'       => $labels[$i] ?? chr(65 + $i),
                'option_en'   => $this->text($opt['en'] ?? null, $opt['hi'] ?? null),
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

    private function normOption(string $text): string
    {
        return mb_strtolower(preg_replace('/\s+/u', ' ', trim($text)));
    }

    /** First non-blank text. Not `?:` — an option such as "0" is falsy in PHP. */
    private function text(?string ...$candidates): string
    {
        foreach ($candidates as $c) {
            if ($c !== null && trim($c) !== '') {
                return $c;
            }
        }

        return '';
    }
}
