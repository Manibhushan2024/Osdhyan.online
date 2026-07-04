<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seeds BPSC 2026 Batch 1 — 500 GS questions (Hindi, PYQ-pattern) from
 * database/data/bpsc_batch1.json into:
 *   - 1 subject ("सामान्य अध्ययन") with one chapter per category
 *   - 3 full mock tests (150 Q / 2 hours / 150 marks, -0.25 negative)
 *   - 1 practice test (50 Q / 40 min)
 *   - 1 published test series bundling all four
 *
 * Runs as a migration because Render's deploy only executes migrate --force
 * (no shell access to run db:seed).
 */
return new class extends Migration
{
    private const SERIES_NAME = 'BPSC 2026 Prelims Test Series — Batch 1';
    private const CHAPTER_SLUG_PREFIX = 'bpsc-b1-ch-';
    private const SUBJECT_SLUG = 'bpsc-gs';

    public function up(): void
    {
        $file = database_path('data/bpsc_batch1.json');
        if (!is_file($file)) {
            return; // data file not shipped — skip silently
        }

        $items = json_decode(file_get_contents($file), true);
        if (!is_array($items) || count($items) === 0) {
            return;
        }

        // Idempotency guard: already seeded?
        if (DB::table('test_series')->where('name_en', self::SERIES_NAME)->exists()) {
            return;
        }

        $now = now();

        DB::transaction(function () use ($items, $now) {
            // ── Exam ──────────────────────────────────────────────────────
            $examId = DB::table('exams')
                ->where('name_en', 'like', '%BPSC%')
                ->orWhere('slug', 'like', 'bpsc%')
                ->value('id');

            if (!$examId) {
                $examId = DB::table('exams')->insertGetId([
                    'name_en'    => 'BPSC (Bihar Public Service Commission)',
                    'name_hi'    => 'बिहार लोक सेवा आयोग',
                    'slug'       => 'bpsc',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // ── Subject ───────────────────────────────────────────────────
            $subjectId = DB::table('subjects')->where('slug', self::SUBJECT_SLUG)->value('id');
            if (!$subjectId) {
                $subjectId = DB::table('subjects')->insertGetId([
                    'exam_id'      => $examId,
                    'name_en'      => 'General Studies (BPSC)',
                    'name_hi'      => 'सामान्य अध्ययन',
                    'slug'         => self::SUBJECT_SLUG,
                    'category'     => 'gs',
                    'is_published' => true,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ]);
            }

            // ── Chapters (one per category) ───────────────────────────────
            $chapterIdByCat = [];
            $catIndex = 0;
            foreach ($items as $item) {
                $cat = $item['cat'] ?? 'General';
                if (isset($chapterIdByCat[$cat])) {
                    continue;
                }
                $catIndex++;
                $slug = self::CHAPTER_SLUG_PREFIX . $catIndex;
                $existing = DB::table('chapters')->where('slug', $slug)->value('id');
                $chapterIdByCat[$cat] = $existing ?: DB::table('chapters')->insertGetId([
                    'subject_id' => $subjectId,
                    'name_en'    => $cat,
                    'name_hi'    => $cat,
                    'slug'       => $slug,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // ── Questions + options ───────────────────────────────────────
            $labels = ['A', 'B', 'C', 'D'];
            $questionIds = [];
            $optionRows = [];

            foreach ($items as $item) {
                $questionId = DB::table('questions')->insertGetId([
                    'subject_id'     => $subjectId,
                    'chapter_id'     => $chapterIdByCat[$item['cat'] ?? 'General'],
                    'question_en'    => $item['q'],
                    'question_hi'    => $item['q'],
                    'explanation_en' => $item['exp'],
                    'explanation_hi' => $item['exp'],
                    'difficulty'     => 'medium',
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
                $questionIds[] = $questionId;

                foreach ($item['opts'] as $i => $optionText) {
                    $optionRows[] = [
                        'question_id' => $questionId,
                        'label'       => $labels[$i],
                        'option_en'   => $optionText,
                        'option_hi'   => $optionText,
                        'is_correct'  => $i === (int) $item['ans'],
                        'created_at'  => $now,
                        'updated_at'  => $now,
                    ];
                }

                if (count($optionRows) >= 400) {
                    DB::table('question_options')->insert($optionRows);
                    $optionRows = [];
                }
            }
            if ($optionRows) {
                DB::table('question_options')->insert($optionRows);
            }

            // ── Tests ─────────────────────────────────────────────────────
            $testDefs = [
                ['name_en' => 'BPSC 2026 GS Mock Test 1', 'name_hi' => 'BPSC 2026 सामान्य अध्ययन मॉक टेस्ट 1', 'from' => 0,   'count' => 150, 'duration' => 7200, 'mode' => 'full_mock'],
                ['name_en' => 'BPSC 2026 GS Mock Test 2', 'name_hi' => 'BPSC 2026 सामान्य अध्ययन मॉक टेस्ट 2', 'from' => 150, 'count' => 150, 'duration' => 7200, 'mode' => 'full_mock'],
                ['name_en' => 'BPSC 2026 GS Mock Test 3', 'name_hi' => 'BPSC 2026 सामान्य अध्ययन मॉक टेस्ट 3', 'from' => 300, 'count' => 150, 'duration' => 7200, 'mode' => 'full_mock'],
                ['name_en' => 'BPSC 2026 GS Practice Test (Batch 1)', 'name_hi' => 'BPSC 2026 सामान्य अध्ययन प्रैक्टिस टेस्ट (बैच 1)', 'from' => 450, 'count' => 50, 'duration' => 2400, 'mode' => 'practice'],
            ];

            $testIds = [];
            foreach ($testDefs as $def) {
                $slice = array_slice($questionIds, $def['from'], $def['count']);
                if (count($slice) === 0) {
                    continue;
                }

                $testId = DB::table('tests')->insertGetId([
                    'exam_id'          => $examId,
                    'subject_id'       => $subjectId,
                    'name_en'          => $def['name_en'],
                    'name_hi'          => $def['name_hi'],
                    'description_en'   => 'PYQ-pattern questions from 67th–71st BPSC analysis, NCERT (6-12) and BSEB textbooks. Detailed explanations after submission.',
                    'description_hi'   => '67वीं–71वीं BPSC PYQ विश्लेषण, NCERT (6-12) एवं BSEB पाठ्यपुस्तकों पर आधारित। सबमिट करने के बाद विस्तृत व्याख्या उपलब्ध।',
                    'mode'             => $def['mode'],
                    'status'           => 'published',
                    'category'         => 'bpsc',
                    'duration_sec'     => $def['duration'],
                    'negative_marking' => 0.25,
                    'question_mark'    => 1,
                    'total_marks'      => count($slice),
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ]);
                $testIds[] = $testId;

                $pivotRows = [];
                foreach ($slice as $order => $questionId) {
                    $pivotRows[] = [
                        'question_id'    => $questionId,
                        'test_id'        => $testId,
                        'sort_order'     => $order,
                        'marks'          => 1.00,
                        'negative_marks' => 0.25,
                    ];
                }
                DB::table('question_test')->insert($pivotRows);
            }

            // ── Test series ───────────────────────────────────────────────
            $seriesId = DB::table('test_series')->insertGetId([
                'exam_id'        => $examId,
                'name_en'        => self::SERIES_NAME,
                'name_hi'        => 'BPSC 2026 प्रीलिम्स टेस्ट सीरीज़ — बैच 1',
                'description_en' => '500 PYQ-pattern GS questions across 3 full mocks (150 Q, 2 hrs) + 1 practice test, with detailed Hindi explanations.',
                'description_hi' => '500 PYQ-पैटर्न सामान्य अध्ययन प्रश्न — 3 फुल मॉक (150 प्रश्न, 2 घंटे) + 1 प्रैक्टिस टेस्ट, विस्तृत हिंदी व्याख्या सहित।',
                'category'       => 'bpsc',
                'is_published'   => true,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);

            DB::table('test_series_tests')->insert(
                array_map(fn ($testId) => [
                    'test_series_id' => $seriesId,
                    'test_id'        => $testId,
                ], $testIds)
            );
        });
    }

    public function down(): void
    {
        DB::transaction(function () {
            $questionIds = DB::table('questions')
                ->join('chapters', 'chapters.id', '=', 'questions.chapter_id')
                ->where('chapters.slug', 'like', self::CHAPTER_SLUG_PREFIX . '%')
                ->pluck('questions.id');

            // options + question_test cascade on question delete
            DB::table('questions')->whereIn('id', $questionIds)->delete();

            $seriesId = DB::table('test_series')->where('name_en', self::SERIES_NAME)->value('id');
            if ($seriesId) {
                $testIds = DB::table('test_series_tests')
                    ->where('test_series_id', $seriesId)
                    ->pluck('test_id');
                DB::table('test_series')->where('id', $seriesId)->delete();
                DB::table('tests')->whereIn('id', $testIds)->delete();
            }

            DB::table('chapters')->where('slug', 'like', self::CHAPTER_SLUG_PREFIX . '%')->delete();
            DB::table('subjects')->where('slug', self::SUBJECT_SLUG)->delete();
        });
    }
};
