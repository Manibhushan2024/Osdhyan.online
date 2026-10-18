<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestSeries;
use App\Models\Topic;
use App\Services\SpreadsheetReader;
use App\Services\TestPayload;
use App\Support\Slug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Bulk import of questions, syllabus and tests from .csv or .xlsx.
 *
 * Every import supports dry_run=1, which parses and validates the whole file
 * and reports exactly what would happen without writing anything. A real
 * import runs in a single transaction: either every valid row lands or none.
 */
class AdminBulkImportController extends Controller
{
    private const FILE_RULE = 'required|file|max:51200';
    private const ALLOWED_EXT = ['csv', 'txt', 'xlsx'];
    private const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

    /**
     * In-memory lookups so a 5,000-row file doesn't hit the DB per row.
     * Reset at the start of every import: Laravel can reuse a controller
     * instance (tests, Octane), and a dry run stores placeholder models here.
     */
    private array $examCache = [];
    private array $subjectCache = [];
    private array $chapterCache = [];
    private array $topicCache = [];

    private function resetLookups(): void
    {
        $this->examCache = $this->subjectCache = $this->chapterCache = $this->topicCache = [];
    }

    // ─── Templates ────────────────────────────────────────────────────────────

    public function template(string $type)
    {
        $templates = [
            'questions' => [
                ['question_en', 'question_hi', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e',
                 'option_a_hi', 'option_b_hi', 'option_c_hi', 'option_d_hi',
                 'correct_option', 'explanation_en', 'explanation_hi', 'difficulty',
                 'exam_code', 'subject_name_en', 'chapter_name_en', 'topic_name_en', 'marks', 'negative_marks'],
                ['Which river is known as the "Sorrow of Bihar"?', 'किस नदी को "बिहार का शोक" कहा जाता है?',
                 'Ganga', 'Kosi', 'Gandak', 'Son', '',
                 'गंगा', 'कोसी', 'गंडक', 'सोन',
                 'B', 'The Kosi changes its course frequently and causes floods.', 'कोसी नदी बार-बार मार्ग बदलती है और बाढ़ लाती है।', 'easy',
                 'BPSC', 'Geography', 'Rivers of Bihar', 'Kosi', '1', '0.25'],
                ['Who founded the Maurya Empire?', 'मौर्य साम्राज्य की स्थापना किसने की?',
                 'Ashoka', 'Bindusara', 'Chandragupta Maurya', 'Bimbisara', '',
                 'अशोक', 'बिन्दुसार', 'चन्द्रगुप्त मौर्य', 'बिम्बिसार',
                 '3', 'Chandragupta Maurya founded the empire around 321 BCE.', '', 'medium',
                 'BPSC', 'History', 'Ancient India', 'Mauryan Empire', '', ''],
            ],
            'syllabus' => [
                ['type', 'exam_code', 'name_en', 'name_hi', 'code', 'category', 'sort_order', 'parent_name_en'],
                ['subject', 'BPSC', 'Geography', 'भूगोल', 'GEO', 'GS', '1', ''],
                ['chapter', 'BPSC', 'Rivers of Bihar', 'बिहार की नदियाँ', '', '', '1', 'Geography'],
                ['topic', 'BPSC', 'Kosi', 'कोसी', '', '', '1', 'Rivers of Bihar'],
            ],
            'tests' => [
                ['type', 'name_en', 'name_hi', 'exam_code', 'series_name', 'mode', 'status', 'duration_min',
                 'question_mark', 'negative_marking', 'section_name', 'subject_name_en', 'chapter_name_en', 'difficulty', 'count', 'ids'],
                ['TEST', 'BPSC Mock Test 5', 'बीपीएससी मॉक टेस्ट 5', 'BPSC', 'BPSC 2026 Batch 1', 'mock', 'draft', '120', '1', '0.25', '', '', '', '', '', ''],
                ['SECTION', '', '', '', '', '', '', '', '1', '0.25', 'General Studies', '', '', '', '', ''],
                ['CRITERIA', '', '', '', '', '', '', '', '', '', '', 'History', '', '', '40', ''],
                ['CRITERIA', '', '', '', '', '', '', '', '', '', '', 'Geography', 'Rivers of Bihar', 'medium', '20', ''],
                ['SECTION', '', '', '', '', '', '', '', '2', '0.5', 'Reasoning', '', '', '', '', ''],
                ['Q_IDS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '101,102,103'],
            ],
        ];

        abort_unless(isset($templates[$type]), 404, 'Unknown template type.');

        $fh = fopen('php://temp', 'r+');
        fwrite($fh, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel shows Hindi correctly
        foreach ($templates[$type] as $row) {
            fputcsv($fh, $row, ',', '"', '');
        }
        rewind($fh);
        $csv = stream_get_contents($fh);
        fclose($fh);

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$type}_template.csv\"",
        ]);
    }

    // ─── Questions ────────────────────────────────────────────────────────────

    public function importQuestions(Request $request): JsonResponse
    {
        $this->resetLookups();
        $request->validate([
            'file'             => self::FILE_RULE,
            'exam_code'        => 'nullable|string|max:50',
            'dry_run'          => 'nullable|boolean',
            'is_published'     => 'nullable|boolean',
            'skip_duplicates'  => 'nullable|boolean',
            // Optional: also build a test from the imported rows, in file order.
            'test_name'        => 'nullable|string|max:255',
            'test_name_hi'     => 'nullable|string|max:255',
            'test_id'          => 'nullable|integer|exists:tests,id',
            'duration_min'     => 'nullable|integer|min:1|max:600',
            'question_mark'    => 'nullable|numeric|min:0|max:100',
            'negative_marking' => 'nullable|numeric|min:0|max:100',
            'mode'             => 'nullable|string|in:practice,mock,pyq,full_mock,sectional',
            'series_id'        => 'nullable|integer|exists:test_series,id',
        ]);

        $rows = $this->readUpload($request);
        if ($rows instanceof JsonResponse) {
            return $rows;
        }

        $dryRun = $request->boolean('dry_run', true);
        $skipDuplicates = $request->boolean('skip_duplicates', true);
        $defaultExam = $request->input('exam_code');

        $errors = [];
        $parsed = [];
        $seenInFile = [];

        foreach ($rows as $row) {
            $line = $row['__row'];
            $result = $this->parseQuestionRow($row, $defaultExam);
            if (is_string($result)) {
                $errors[] = "Row {$line}: {$result}";
                continue;
            }

            $fingerprint = $this->fingerprint($result['question_en']);
            if (isset($seenInFile[$fingerprint])) {
                $errors[] = "Row {$line}: duplicate of row {$seenInFile[$fingerprint]} in this file — skipped.";
                continue;
            }
            $seenInFile[$fingerprint] = $line;
            $result['line'] = $line;
            $result['fingerprint'] = $fingerprint;
            $parsed[] = $result;
        }

        // Existing questions with the same text are reused instead of duplicated.
        $existing = $skipDuplicates ? $this->existingQuestionIds(array_column($parsed, 'question_en')) : [];
        $skipped = 0;
        foreach ($parsed as &$q) {
            $q['existing_id'] = $existing[$q['fingerprint']] ?? null;
            if ($q['existing_id']) {
                $skipped++;
            }
        }
        unset($q);

        $toCreate = count($parsed) - $skipped;
        $wantsTest = $request->filled('test_name') || $request->filled('test_id');

        $response = [
            'dry_run'          => $dryRun,
            'total_rows'       => count($rows),
            'created'          => $toCreate,
            'skipped'          => $skipped,
            'error_count'      => count($errors),
            'errors'           => array_slice($errors, 0, 500),
            'sample_questions' => array_map(fn ($q) => $this->sample($q), array_slice($parsed, 0, 5)),
        ];

        if ($dryRun) {
            $response['message'] = sprintf(
                '%d question(s) ready to import, %d already in the bank%s, %d row(s) with errors.%s',
                $toCreate, $skipped, $skipped ? ' (will be reused)' : '', count($errors),
                $wantsTest && $parsed ? ' A test with ' . count($parsed) . ' questions will be ' . ($request->filled('test_id') ? 'updated.' : 'created.') : ''
            );

            return response()->json($response, 200, [], JSON_UNESCAPED_UNICODE);
        }

        if (!$parsed) {
            $response['message'] = 'Nothing imported — fix the errors and try again.';
            return response()->json($response, 422, [], JSON_UNESCAPED_UNICODE);
        }

        try {
            $outcome = DB::transaction(function () use ($parsed, $request, $wantsTest) {
                $ids = $this->insertQuestions($parsed);

                $test = null;
                if ($wantsTest) {
                    $test = $this->testFromImport($request, $parsed, $ids);
                }

                return ['ids' => $ids, 'test' => $test];
            });
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'message' => 'Import failed and was rolled back: ' . $e->getMessage(),
            ] + $response, 500, [], JSON_UNESCAPED_UNICODE);
        }

        $this->forgetSyllabusCaches();
        TestPayload::forgetForQuestions(array_values(array_filter(array_column($parsed, 'existing_id'))));

        $response['message'] = "Imported {$toCreate} new question(s)"
            . ($skipped ? ", reused {$skipped} existing" : '')
            . (count($errors) ? ', ' . count($errors) . ' row(s) skipped due to errors' : '') . '.';

        if ($outcome['test']) {
            $t = $outcome['test'];
            $response['test_id'] = $t->id;
            $response['test_name'] = $t->name_en;
            $response['status'] = $t->status;
            $response['question_count'] = DB::table('question_test')->where('test_id', $t->id)->count();
            $response['message'] .= " Test \"{$t->name_en}\" (ID {$t->id}) now has {$response['question_count']} questions and is {$t->status}.";
        }

        return response()->json($response, 201, [], JSON_UNESCAPED_UNICODE);
    }

    /** @return array|string parsed question or an error message */
    private function parseQuestionRow(array $row, ?string $defaultExam): array|string
    {
        $get = fn (string ...$keys) => $this->first($row, $keys);

        $questionEn = $get('question_en', 'question', 'question_text', 'question_english');
        $questionHi = $get('question_hi', 'question_hindi');
        if ($questionEn === '' && $questionHi === '') {
            return 'question_en is empty.';
        }

        $options = [];
        foreach (self::LABELS as $i => $label) {
            $l = strtolower($label);
            $en = $get("option_{$l}", "option_{$l}_en", "option{$l}", "opt_{$l}", 'option_' . ($i + 1), "{$l}");
            $hi = $get("option_{$l}_hi", "option_{$l}_hindi", 'option_' . ($i + 1) . '_hi');
            if ($en === '' && $hi === '') {
                continue;
            }
            $options[] = ['label' => $label, 'option_en' => $en !== '' ? $en : $hi, 'option_hi' => $hi !== '' ? $hi : null];
        }
        if (count($options) < 2) {
            return 'at least two options (option_a, option_b) are required.';
        }

        $correctRaw = strtoupper(trim($get('correct_option', 'correct', 'answer', 'correct_answer', 'ans')));
        $correctRaw = preg_replace('/^(OPTION|OPT)[\s_]*/', '', $correctRaw);
        $correctIdx = null;
        if ($correctRaw !== '' && ctype_digit($correctRaw)) {
            $correctIdx = (int) $correctRaw - 1;
        } elseif ($correctRaw !== '' && in_array($correctRaw, self::LABELS, true)) {
            $correctIdx = array_search($correctRaw, self::LABELS, true);
        } elseif ($correctRaw !== '') {
            // Answer given as the option text itself
            foreach ($options as $i => $o) {
                if (mb_strtolower(trim($o['option_en'])) === mb_strtolower($correctRaw)) {
                    $correctIdx = $i;
                }
            }
        }

        $labelsPresent = array_column($options, 'label');
        if ($correctIdx === null || !isset(self::LABELS[$correctIdx]) || !in_array(self::LABELS[$correctIdx], $labelsPresent, true)) {
            return "correct_option \"{$correctRaw}\" is missing or doesn't match a filled option (use A/B/C/D or 1/2/3/4).";
        }
        $correctLabel = self::LABELS[$correctIdx];
        foreach ($options as &$o) {
            $o['is_correct'] = $o['label'] === $correctLabel;
        }
        unset($o);

        $difficulty = strtolower($get('difficulty', 'level')) ?: 'medium';
        $difficulty = ['e' => 'easy', 'm' => 'medium', 'h' => 'hard', 'moderate' => 'medium', 'difficult' => 'hard', 'tough' => 'hard'][$difficulty] ?? $difficulty;
        if (!in_array($difficulty, ['easy', 'medium', 'hard'], true)) {
            return "difficulty \"{$difficulty}\" must be easy, medium or hard.";
        }

        $marks = $get('marks', 'mark', 'positive_marks');
        $negative = $get('negative_marks', 'negative', 'negative_marking', 'minus');
        foreach (['marks' => $marks, 'negative_marks' => $negative] as $field => $value) {
            if ($value !== '' && !is_numeric($value)) {
                return "{$field} \"{$value}\" is not a number.";
            }
        }

        // Taxonomy (optional). Subject/chapter/topic are created if missing.
        $examCode = $get('exam_code', 'exam') ?: (string) $defaultExam;
        $subjectName = $get('subject_name_en', 'subject', 'subject_name');
        $chapterName = $get('chapter_name_en', 'chapter', 'chapter_name');
        $topicName = $get('topic_name_en', 'topic', 'topic_name');

        $exam = null;
        if ($examCode !== '') {
            $exam = $this->findExam($examCode);
            if (!$exam) {
                return "exam_code \"{$examCode}\" not found — create the exam first or fix the code.";
            }
        }
        if ($subjectName !== '' && !$exam) {
            return 'subject_name_en needs an exam_code (in the row or the "Default Exam Code" field).';
        }
        if ($chapterName !== '' && $subjectName === '') {
            return 'chapter_name_en needs subject_name_en.';
        }
        if ($topicName !== '' && $chapterName === '') {
            return 'topic_name_en needs chapter_name_en.';
        }

        return [
            'question_en'    => $questionEn !== '' ? $questionEn : $questionHi,
            'question_hi'    => $questionHi !== '' ? $questionHi : null,
            'explanation_en' => $get('explanation_en', 'explanation', 'solution', 'solution_en') ?: null,
            'explanation_hi' => $get('explanation_hi', 'solution_hi') ?: null,
            'image_path'     => $get('image_url', 'image', 'image_path') ?: null,
            'difficulty'     => $difficulty,
            'options'        => $options,
            'marks'          => $marks !== '' ? (float) $marks : null,
            'negative_marks' => $negative !== '' ? (float) $negative : null,
            'exam'           => $exam,
            'subject'        => $subjectName,
            'chapter'        => $chapterName,
            'topic'          => $topicName,
        ];
    }

    /** @return array<int, int> question id per parsed row, in file order */
    private function insertQuestions(array $parsed): array
    {
        $now = now();
        $ids = [];
        $new = [];

        foreach ($parsed as $i => $q) {
            if ($q['existing_id']) {
                $ids[$i] = (int) $q['existing_id'];
                continue;
            }

            [$subjectId, $chapterId, $topicId] = $this->resolveTaxonomy($q);
            $new[$i] = [
                'subject_id'     => $subjectId,
                'chapter_id'     => $chapterId,
                'topic_id'       => $topicId,
                'question_en'    => $q['question_en'],
                'question_hi'    => $q['question_hi'],
                'image_path'     => $q['image_path'],
                'explanation_en' => $q['explanation_en'],
                'explanation_hi' => $q['explanation_hi'],
                'difficulty'     => $q['difficulty'],
                'content_hash'   => $q['fingerprint'],
                'created_at'     => $now,
                'updated_at'     => $now,
            ];
        }

        // Bulk insert in chunks; Postgres returns ids in VALUES order.
        foreach (array_chunk($new, 300, true) as $chunk) {
            $indexes = array_keys($chunk);
            $created = $this->insertReturningIds('questions', array_values($chunk));
            foreach ($indexes as $pos => $i) {
                $ids[$i] = $created[$pos];
            }
        }

        $optionRows = [];
        foreach ($new as $i => $_) {
            foreach ($parsed[$i]['options'] as $o) {
                $optionRows[] = [
                    'question_id' => $ids[$i],
                    'label'       => $o['label'],
                    'option_en'   => $o['option_en'],
                    'option_hi'   => $o['option_hi'],
                    'is_correct'  => $o['is_correct'],
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];
            }
        }
        foreach (array_chunk($optionRows, 1000) as $chunk) {
            DB::table('question_options')->insert($chunk);
        }

        ksort($ids);

        return $ids;
    }

    private function insertReturningIds(string $table, array $rows): array
    {
        if (DB::getDriverName() !== 'pgsql') {
            return array_map(fn ($r) => (int) DB::table($table)->insertGetId($r), $rows);
        }

        $columns = array_keys($rows[0]);
        $placeholders = '(' . implode(',', array_fill(0, count($columns), '?')) . ')';
        $bindings = [];
        foreach ($rows as $r) {
            foreach ($columns as $c) {
                $bindings[] = $r[$c];
            }
        }
        $sql = 'INSERT INTO ' . $table . ' (' . implode(',', array_map(fn ($c) => '"' . $c . '"', $columns)) . ') VALUES '
            . implode(',', array_fill(0, count($rows), $placeholders)) . ' RETURNING id';

        return array_map(fn ($r) => (int) $r->id, DB::select($sql, $bindings));
    }

    private function testFromImport(Request $request, array $parsed, array $ids): Test
    {
        if ($request->filled('test_id')) {
            $test = Test::findOrFail($request->integer('test_id'));
        } else {
            $examId = collect($parsed)->pluck('exam')->filter()->first()?->id
                ?? ($request->filled('exam_code') ? $this->findExam($request->input('exam_code'))?->id : null);

            $test = Test::create([
                'exam_id'          => $examId,
                'name_en'          => $request->input('test_name'),
                'name_hi'          => $request->input('test_name_hi') ?: $request->input('test_name'),
                'mode'             => $request->input('mode', 'mock'),
                'category'         => $request->input('mode', 'mock'),
                'status'           => $request->boolean('is_published') ? 'published' : 'draft',
                'duration_sec'     => (int) $request->input('duration_min', 60) * 60,
                'question_mark'    => (float) $request->input('question_mark', 1),
                'negative_marking' => (float) $request->input('negative_marking', 0),
                'total_marks'      => 0,
            ]);
        }

        $attach = [];
        foreach ($parsed as $i => $q) {
            $attach[] = ['id' => $ids[$i], 'marks' => $q['marks'], 'negative_marks' => $q['negative_marks']];
        }
        $test->appendQuestions($attach);
        $test->refreshTotalMarks();

        if ($request->filled('series_id')) {
            TestSeries::find($request->integer('series_id'))?->tests()->syncWithoutDetaching([$test->id]);
        }

        return $test->fresh();
    }

    private function sample(array $q): array
    {
        return [
            'question_en' => $q['question_en'],
            'options'     => array_map(fn ($o) => ['text' => $o['option_en'], 'is_correct' => $o['is_correct']], $q['options']),
            'exam'        => $q['exam']?->code ?: $q['exam']?->name_en,
            'subject'     => $q['subject'] ?: null,
            'chapter'     => $q['chapter'] ?: null,
            'topic'       => $q['topic'] ?: null,
            'difficulty'  => $q['difficulty'],
            'reused'      => (bool) ($q['existing_id'] ?? false),
        ];
    }

    private function fingerprint(string $text): string
    {
        return Question::fingerprint($text);
    }

    /** @return array<string, int> fingerprint => question id */
    private function existingQuestionIds(array $texts): array
    {
        $found = [];
        $hashes = array_unique(array_map(fn ($t) => $this->fingerprint($t), $texts));
        foreach (array_chunk($hashes, 500) as $chunk) {
            DB::table('questions')
                ->whereIn('content_hash', $chunk)
                ->orderBy('id')
                ->get(['id', 'content_hash'])
                ->each(function ($r) use (&$found) {
                    $found[$r->content_hash] ??= (int) $r->id;
                });
        }

        return $found;
    }

    // ─── Syllabus ─────────────────────────────────────────────────────────────

    public function importSyllabus(Request $request): JsonResponse
    {
        $this->resetLookups();
        $request->validate(['file' => self::FILE_RULE, 'dry_run' => 'nullable|boolean']);

        $rows = $this->readUpload($request);
        if ($rows instanceof JsonResponse) {
            return $rows;
        }

        $dryRun = $request->boolean('dry_run', true);
        $errors = [];
        $created = [];
        $skipped = [];

        $run = function () use ($rows, $dryRun, &$errors, &$created, &$skipped) {
            // Subjects first, then chapters, then topics, so parents exist.
            $order = ['subject' => 0, 'chapter' => 1, 'topic' => 2];
            usort($rows, fn ($a, $b) => ($order[strtolower($a['type'] ?? '')] ?? 9) <=> ($order[strtolower($b['type'] ?? '')] ?? 9));

            foreach ($rows as $row) {
                $line = $row['__row'];
                $type = strtolower($row['type'] ?? '');
                $name = $row['name_en'] ?? '';
                $examCode = $row['exam_code'] ?? '';
                $parent = $row['parent_name_en'] ?? '';

                if (!isset($order[$type])) {
                    $errors[] = "Row {$line}: type must be subject, chapter or topic.";
                    continue;
                }
                if ($name === '') {
                    $errors[] = "Row {$line}: name_en is empty.";
                    continue;
                }
                $exam = $this->findExam($examCode);
                if (!$exam) {
                    $errors[] = "Row {$line}: exam_code \"{$examCode}\" not found.";
                    continue;
                }

                $extra = [
                    'name_hi'    => ($row['name_hi'] ?? '') ?: null,
                    'code'       => ($row['code'] ?? '') ?: null,
                    'category'   => ($row['category'] ?? '') ?: null,
                    'sort_order' => is_numeric($row['sort_order'] ?? '') ? (int) $row['sort_order'] : null,
                ];

                if ($type === 'subject') {
                    $result = $this->subject($exam, $name, $extra, $dryRun);
                } elseif ($type === 'chapter') {
                    $subject = $parent !== '' ? $this->subject($exam, $parent, [], true, true) : null;
                    if (!$subject) {
                        $errors[] = "Row {$line}: parent subject \"{$parent}\" not found under " . ($exam->code ?: $exam->name_en) . ".";
                        continue;
                    }
                    $result = $this->chapter($subject, $name, $extra, $dryRun);
                } else {
                    $chapter = $parent !== '' ? $this->findChapterInExam($exam, $parent) : null;
                    if (!$chapter) {
                        $errors[] = "Row {$line}: parent chapter \"{$parent}\" not found under " . ($exam->code ?: $exam->name_en) . ".";
                        continue;
                    }
                    $result = $this->topic($chapter, $name, $extra, $dryRun);
                }

                [$wasCreated] = $result;
                $label = ucfirst($type) . " \"{$name}\"" . ($parent ? " (under {$parent})" : '');
                if ($wasCreated) {
                    $created[] = $label;
                } else {
                    $skipped[] = "{$label} already exists";
                }
            }
        };

        if ($dryRun) {
            $run();
        } else {
            DB::transaction($run);
            $this->forgetSyllabusCaches();
        }

        return response()->json([
            'dry_run'     => $dryRun,
            'message'     => ($dryRun ? 'Would create ' : 'Created ') . count($created) . ' item(s); '
                . count($skipped) . ' already existed; ' . count($errors) . ' error(s).',
            'total_rows'  => count($rows),
            'created'     => count($created),
            'skipped'     => count($skipped),
            'error_count' => count($errors),
            'errors'      => $errors,
            'details'     => ['created' => $created, 'skipped' => $skipped, 'errors' => $errors],
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    public function importTests(Request $request): JsonResponse
    {
        $this->resetLookups();
        $request->validate(['file' => self::FILE_RULE, 'dry_run' => 'nullable|boolean']);

        $rows = $this->readUpload($request);
        if ($rows instanceof JsonResponse) {
            return $rows;
        }

        $dryRun = $request->boolean('dry_run', true);
        $errors = [];
        $meta = null;
        $sections = [];
        $current = null;
        $picked = [];

        // Explicit Q_IDS are reserved up front so CRITERIA rows never pick
        // them first — keeps preview and real import counts identical.
        $reserved = [];
        foreach ($rows as $row) {
            if (strtoupper($row['type'] ?? '') === 'Q_IDS') {
                foreach (preg_split('/[\s,;|]+/', $row['ids'] ?? '') as $id) {
                    if ((int) $id > 0) {
                        $reserved[(int) $id] = true;
                    }
                }
            }
        }

        foreach ($rows as $row) {
            $line = $row['__row'];
            $type = strtoupper($row['type'] ?? '');

            switch ($type) {
                case 'TEST':
                    if ($meta) {
                        $errors[] = "Row {$line}: only one TEST row per file — ignored.";
                        break;
                    }
                    $meta = $row;
                    break;

                case 'SECTION':
                    $sections[] = [
                        'name'     => ($row['section_name'] ?? '') ?: ($row['name_en'] ?? '') ?: 'Section ' . (count($sections) + 1),
                        'marks'    => is_numeric($row['question_mark'] ?? '') ? (float) $row['question_mark'] : null,
                        'negative' => is_numeric($row['negative_marking'] ?? '') ? (float) $row['negative_marking'] : null,
                        'ids'      => [],
                    ];
                    $current = array_key_last($sections);
                    break;

                case 'CRITERIA':
                case 'Q_IDS':
                    if ($current === null) {
                        $sections[] = ['name' => 'Section 1', 'marks' => null, 'negative' => null, 'ids' => []];
                        $current = array_key_last($sections);
                    }
                    if ($type === 'Q_IDS') {
                        $ids = array_values(array_filter(array_map('intval', preg_split('/[\s,;|]+/', $row['ids'] ?? ''))));
                        $valid = DB::table('questions')->whereIn('id', $ids)->pluck('id')->map(fn ($id) => (int) $id)->all();
                        foreach (array_diff($ids, $valid) as $missing) {
                            $errors[] = "Row {$line}: question ID {$missing} not found.";
                        }
                        foreach ($valid as $id) {
                            if (!isset($picked[$id])) {
                                $picked[$id] = true;
                                $sections[$current]['ids'][] = $id;
                            }
                        }
                    } else {
                        if (!$meta) {
                            $errors[] = "Row {$line}: put the TEST row before CRITERIA rows.";
                            break;
                        }
                        $ids = $this->pickByCriteria($meta, $row, array_keys($picked + $reserved), $line, $errors);
                        foreach ($ids as $id) {
                            $picked[$id] = true;
                            $sections[$current]['ids'][] = $id;
                        }
                    }
                    break;

                default:
                    $errors[] = "Row {$line}: unknown type \"{$type}\" (use TEST, SECTION, CRITERIA or Q_IDS).";
            }
        }

        if (!$meta || trim($meta['name_en'] ?? '') === '') {
            return response()->json([
                'dry_run' => $dryRun, 'message' => 'The file needs one TEST row with a name_en.',
                'created' => 0, 'errors' => $errors, 'error_count' => count($errors) + 1,
            ], 422);
        }

        $exam = ($meta['exam_code'] ?? '') !== '' ? $this->findExam($meta['exam_code']) : null;
        if (($meta['exam_code'] ?? '') !== '' && !$exam) {
            $errors[] = "TEST row: exam_code \"{$meta['exam_code']}\" not found.";
        }

        $questionCount = array_sum(array_map(fn ($s) => count($s['ids']), $sections));
        $response = [
            'dry_run'          => $dryRun,
            'test_name'        => $meta['name_en'],
            'exam_code'        => $exam?->code ?: ($meta['exam_code'] ?? null),
            'sections_count'   => count($sections),
            'question_count'   => $questionCount,
            'created'          => $questionCount,
            'error_count'      => count($errors),
            'errors'           => $errors,
            'sections_preview' => array_map(fn ($s) => [
                'name' => $s['name'], 'question_count' => count($s['ids']), 'sample_ids' => array_slice($s['ids'], 0, 5),
            ], $sections),
        ];

        if ($questionCount === 0) {
            $response['message'] = 'No questions matched — check CRITERIA subject/chapter names or Q_IDS.';
            return response()->json($response, $dryRun ? 200 : 422);
        }

        $status = strtolower($meta['status'] ?? '') === 'published' ? 'published' : 'draft';
        $durationMin = is_numeric($meta['duration_min'] ?? '') ? (int) $meta['duration_min'] : 60;

        if ($dryRun) {
            $response['message'] = "Would create \"{$meta['name_en']}\" ({$durationMin} min, {$questionCount} questions, {$status}).";
            return response()->json($response, 200, [], JSON_UNESCAPED_UNICODE);
        }

        $test = DB::transaction(function () use ($meta, $exam, $sections, $status, $durationMin) {
            $mode = strtolower($meta['mode'] ?? '') ?: 'mock';
            $test = Test::create([
                'exam_id'          => $exam?->id,
                'name_en'          => $meta['name_en'],
                'name_hi'          => ($meta['name_hi'] ?? '') ?: $meta['name_en'],
                'mode'             => $mode,
                'category'         => $mode,
                'status'           => $status,
                'duration_sec'     => $durationMin * 60,
                'question_mark'    => is_numeric($meta['question_mark'] ?? '') ? (float) $meta['question_mark'] : 1,
                'negative_marking' => is_numeric($meta['negative_marking'] ?? '') ? (float) $meta['negative_marking'] : 0,
                'total_marks'      => 0,
            ]);

            $attach = [];
            foreach ($sections as $s) {
                foreach ($s['ids'] as $id) {
                    $attach[] = ['id' => $id, 'marks' => $s['marks'], 'negative_marks' => $s['negative']];
                }
            }
            $test->appendQuestions($attach);
            $test->refreshTotalMarks();

            if (($meta['series_name'] ?? '') !== '') {
                $series = TestSeries::firstOrCreate(
                    ['name_en' => $meta['series_name'], 'exam_id' => $exam?->id],
                    ['is_published' => true]
                );
                $series->tests()->syncWithoutDetaching([$test->id]);
            }

            return $test;
        });

        $response['test_id'] = $test->id;
        $response['status'] = $test->status;
        $response['message'] = "Created \"{$test->name_en}\" with {$questionCount} questions.";

        return response()->json($response, 201, [], JSON_UNESCAPED_UNICODE);
    }

    private function pickByCriteria(array $meta, array $row, array $exclude, string $line, array &$errors): array
    {
        $count = (int) ($row['count'] ?? 0);
        if ($count < 1) {
            $errors[] = "Row {$line}: CRITERIA needs a count of at least 1.";
            return [];
        }

        $exam = $this->findExam($row['exam_code'] ?? '' ?: ($meta['exam_code'] ?? ''));
        $query = DB::table('questions as q')->select('q.id');

        $subjectName = $row['subject_name_en'] ?? '';
        if ($subjectName !== '') {
            $query->join('subjects as s', 's.id', '=', 'q.subject_id')
                ->whereRaw('LOWER(s.name_en) = ?', [mb_strtolower($subjectName)]);
            if ($exam) {
                $query->where('s.exam_id', $exam->id);
            }
        }
        if (($row['chapter_name_en'] ?? '') !== '') {
            $query->join('chapters as c', 'c.id', '=', 'q.chapter_id')
                ->whereRaw('LOWER(c.name_en) = ?', [mb_strtolower($row['chapter_name_en'])]);
        }
        if (in_array(strtolower($row['difficulty'] ?? ''), ['easy', 'medium', 'hard'], true)) {
            $query->where('q.difficulty', strtolower($row['difficulty']));
        }
        if ($exclude) {
            $query->whereNotIn('q.id', $exclude);
        }

        $ids = $query->inRandomOrder()->limit($count)->pluck('id')->map(fn ($id) => (int) $id)->all();
        if (count($ids) < $count) {
            $errors[] = "Row {$line}: wanted {$count} questions for "
                . trim("{$subjectName} " . ($row['chapter_name_en'] ?? '')) . ', found only ' . count($ids) . '.';
        }

        return $ids;
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────

    private function readUpload(Request $request): array|JsonResponse
    {
        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, [...self::ALLOWED_EXT, 'xls'], true)) {
            return response()->json(['message' => 'Upload a .csv or .xlsx file.'], 422);
        }

        try {
            $rows = SpreadsheetReader::read($file->getRealPath(), $file->getClientOriginalName());
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        if (!$rows) {
            return response()->json(['message' => 'The file has a header row but no data rows.'], 422);
        }

        return $rows;
    }

    private function first(array $row, array $keys): string
    {
        foreach ($keys as $k) {
            if (isset($row[$k]) && trim($row[$k]) !== '') {
                return trim($row[$k]);
            }
        }

        return '';
    }

    private function findExam(?string $code): ?Exam
    {
        $code = trim((string) $code);
        if ($code === '') {
            return null;
        }
        $k = mb_strtolower($code);
        if (!array_key_exists($k, $this->examCache)) {
            $this->examCache[$k] = Exam::whereRaw('LOWER(code) = ?', [$k])
                ->orWhereRaw('LOWER(slug) = ?', [$k])
                ->orWhereRaw('LOWER(name_en) = ?', [$k])
                ->orderBy('id')
                ->first();
        }

        return $this->examCache[$k];
    }

    /** @return array{0: ?int, 1: ?int, 2: ?int} */
    private function resolveTaxonomy(array $q): array
    {
        if (!$q['exam'] || $q['subject'] === '') {
            return [null, null, null];
        }
        [, $subject] = $this->subject($q['exam'], $q['subject'], [], false);
        $chapter = $q['chapter'] !== '' ? $this->chapter($subject, $q['chapter'], [], false)[1] : null;
        $topic = ($chapter && $q['topic'] !== '') ? $this->topic($chapter, $q['topic'], [], false)[1] : null;

        return [$subject->id, $chapter?->id, $topic?->id];
    }

    /** @return array{0: bool, 1: ?Subject}|Subject|null */
    private function subject(Exam $exam, string $name, array $extra, bool $dryRun, bool $lookupOnly = false)
    {
        $k = $exam->id . '|' . mb_strtolower($name);
        $found = $this->subjectCache[$k] ??= Subject::where('exam_id', $exam->id)
            ->whereRaw('LOWER(name_en) = ?', [mb_strtolower($name)])->first() ?: false;

        if ($lookupOnly) {
            return $found ?: null;
        }
        if ($found) {
            return [false, $found];
        }
        if ($dryRun) {
            // Pretend it exists so child rows in the same dry run validate.
            $this->subjectCache[$k] = new Subject(['exam_id' => $exam->id, 'name_en' => $name]);
            return [true, $this->subjectCache[$k]];
        }

        $subject = Subject::create(array_filter([
            'exam_id'      => $exam->id,
            'name_en'      => $name,
            'slug'         => Slug::unique('subjects', ($exam->code ?: $exam->slug) . ' ' . $name, 'subject'),
            'is_published' => true,
        ] + $extra, fn ($v) => $v !== null));

        return [true, $this->subjectCache[$k] = $subject];
    }

    private function chapter(Subject $subject, string $name, array $extra, bool $dryRun): array
    {
        $k = ($subject->id ?: spl_object_id($subject)) . '|' . mb_strtolower($name);
        $found = $this->chapterCache[$k] ??= ($subject->exists
            ? Chapter::where('subject_id', $subject->id)->whereRaw('LOWER(name_en) = ?', [mb_strtolower($name)])->first()
            : null) ?: false;

        if ($found) {
            return [false, $found];
        }
        if ($dryRun) {
            $this->chapterCache[$k] = new Chapter(['subject_id' => $subject->id, 'name_en' => $name]);
            $this->chapterCache[$k]->setRelation('subject', $subject);
            return [true, $this->chapterCache[$k]];
        }

        $chapter = Chapter::create([
            'subject_id' => $subject->id,
            'name_en'    => $name,
            'name_hi'    => $extra['name_hi'] ?? null,
            'slug'       => Slug::unique('chapters', $subject->name_en . ' ' . $name, 'chapter'),
        ]);

        return [true, $this->chapterCache[$k] = $chapter];
    }

    private function topic(Chapter $chapter, string $name, array $extra, bool $dryRun): array
    {
        $k = ($chapter->id ?: spl_object_id($chapter)) . '|' . mb_strtolower($name);
        $found = $this->topicCache[$k] ??= ($chapter->exists
            ? Topic::where('chapter_id', $chapter->id)->whereRaw('LOWER(name_en) = ?', [mb_strtolower($name)])->first()
            : null) ?: false;

        if ($found) {
            return [false, $found];
        }
        if ($dryRun) {
            return [true, $this->topicCache[$k] = new Topic(['chapter_id' => $chapter->id, 'name_en' => $name])];
        }

        $topic = Topic::create([
            'chapter_id' => $chapter->id,
            'name_en'    => $name,
            'name_hi'    => $extra['name_hi'] ?? null,
            'slug'       => Slug::unique('topics', $chapter->name_en . ' ' . $name, 'topic'),
        ]);

        return [true, $this->topicCache[$k] = $topic];
    }

    private function findChapterInExam(Exam $exam, string $name): ?Chapter
    {
        // Prefer chapters created earlier in this same import.
        foreach ($this->chapterCache as $chapter) {
            if ($chapter && mb_strtolower($chapter->name_en) === mb_strtolower($name)) {
                return $chapter;
            }
        }

        return Chapter::whereRaw('LOWER(chapters.name_en) = ?', [mb_strtolower($name)])
            ->whereIn('subject_id', Subject::where('exam_id', $exam->id)->select('id'))
            ->first();
    }

    private function forgetSyllabusCaches(): void
    {
        foreach (array_filter($this->examCache) as $exam) {
            Cache::forget("exam_{$exam->id}_subjects");
            Cache::forget("exam_{$exam->id}_full");
            Cache::forget("exam_{$exam->id}_full_v2");
        }
        Cache::forget('exams_list');
    }
}
