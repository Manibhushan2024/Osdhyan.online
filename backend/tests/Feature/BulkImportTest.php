<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\Topic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;
use ZipArchive;

class BulkImportTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->exam('BPSC');
        $this->actingAsStudent($this->admin());
    }

    private function csv(string $content, string $name = 'questions.csv'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, $content);
    }

    /** Minimal valid .xlsx with shared strings + an inline string + a number, built by hand. */
    private function xlsx(array $rows, string $name = 'questions.xlsx'): UploadedFile
    {
        $shared = [];
        $sheetRows = '';
        foreach ($rows as $r => $cells) {
            $rowNo = $r + 1;
            $sheetRows .= "<row r=\"{$rowNo}\">";
            foreach (array_values($cells) as $c => $value) {
                $ref = chr(65 + $c) . $rowNo;
                if ($value === null || $value === '') {
                    continue; // sparse row — reader must use the r="" refs
                }
                if (is_int($value) || is_float($value)) {
                    $sheetRows .= "<c r=\"{$ref}\"><v>{$value}</v></c>";
                } else {
                    $idx = $shared[$value] ??= count($shared);
                    $sheetRows .= "<c r=\"{$ref}\" t=\"s\"><v>{$idx}</v></c>";
                }
            }
            $sheetRows .= '</row>';
        }
        $sst = '';
        foreach (array_keys($shared) as $text) {
            $sst .= '<si><t>' . htmlspecialchars($text, ENT_XML1) . '</t></si>';
        }

        $path = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new ZipArchive();
        $zip->open($path, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Questions" sheetId="1" r:id="rId1"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
        $zip->addFromString('xl/sharedStrings.xml', '<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . $sst . '</sst>');
        $zip->addFromString('xl/worksheets/sheet1.xml', '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' . $sheetRows . '</sheetData></worksheet>');
        $zip->close();

        return new UploadedFile($path, $name, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }

    private const HEADER = "question_en,question_hi,option_a,option_b,option_c,option_d,correct_option,explanation_en,difficulty,exam_code,subject_name_en,chapter_name_en,topic_name_en,marks,negative_marks\n";

    // ─── Questions ────────────────────────────────────────────────────────────

    public function test_template_downloads_as_utf8_csv_with_bom(): void
    {
        $res = $this->get('/api/admin/bulk-import/template/questions')->assertOk();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $res->getContent());
        $this->assertStringContainsString('correct_option', $res->getContent());
        $this->get('/api/admin/bulk-import/template/nope')->assertNotFound();
    }

    public function test_downloaded_template_imports_cleanly(): void
    {
        $template = $this->get('/api/admin/bulk-import/template/questions')->getContent();

        $this->post('/api/admin/bulk-import/questions', ['file' => $this->csv($template), 'dry_run' => '1'])
            ->assertOk()->assertJson(['created' => 2, 'error_count' => 0]);
    }

    public function test_dry_run_reports_without_writing_anything(): void
    {
        $file = $this->csv(self::HEADER
            . "What is 2+2?,,3,4,5,6,B,Basic math,easy,BPSC,Mathematics,Arithmetic,Addition,,\n"
            . "Only one option?,,X,,,,A,,,,,,,,\n");

        $res = $this->post('/api/admin/bulk-import/questions', ['file' => $file, 'dry_run' => '1'])->assertOk();

        $res->assertJson(['dry_run' => true, 'total_rows' => 2, 'created' => 1, 'error_count' => 1]);
        $this->assertStringContainsString('Row 3', $res->json('errors.0'));
        $this->assertSame('4', collect($res->json('sample_questions.0.options'))->firstWhere('is_correct', true)['text']);
        $this->assertSame(0, Question::count());
        $this->assertSame(0, Subject::where('name_en', 'Mathematics')->count());
    }

    public function test_import_creates_questions_options_and_taxonomy(): void
    {
        $file = $this->csv(self::HEADER
            . "What is 2+2?,दो और दो?,3,4,5,6,B,Basic math,easy,BPSC,Mathematics,Arithmetic,Addition,,\n"
            . "Capital of Bihar?,,Patna,Gaya,Ranchi,Bhagalpur,Patna,,,bpsc,Geography,,,,\n");

        $this->post('/api/admin/bulk-import/questions', ['file' => $file, 'dry_run' => '0'])
            ->assertCreated()->assertJson(['created' => 2, 'error_count' => 0]);

        $q = Question::where('question_en', 'What is 2+2?')->with('options')->firstOrFail();
        $this->assertSame('दो और दो?', $q->question_hi);
        $this->assertSame('easy', $q->difficulty);
        $this->assertSame(['A', 'B', 'C', 'D'], $q->options->pluck('label')->all());
        $this->assertSame('4', $q->options->firstWhere('is_correct', true)->option_en);
        $this->assertSame('Mathematics', $q->subject->name_en);
        $this->assertSame('Arithmetic', Chapter::find($q->chapter_id)->name_en);
        $this->assertSame('Addition', Topic::find($q->topic_id)->name_en);

        // Answer given as option text ("Patna") resolves to option A.
        $capital = Question::where('question_en', 'Capital of Bihar?')->with('options')->first();
        $this->assertSame('A', $capital->options->firstWhere('is_correct', true)->label);
    }

    public function test_reports_row_level_errors(): void
    {
        $file = $this->csv(self::HEADER
            . "Bad answer?,,X,Y,Z,W,F,,,,,,,,\n"
            . "Unknown exam?,,X,Y,Z,W,A,,,UPSC,History,,,,\n"
            . "Bad difficulty?,,X,Y,Z,W,A,,super,,,,,,\n"
            . "Chapter without subject?,,X,Y,Z,W,A,,,BPSC,,Ch,,,\n"
            . "Bad marks?,,X,Y,Z,W,A,,,,,,,two,\n"
            . ",,,,,,,,,,,,,,\n"
            . "Good?,,X,Y,Z,W,2,,,,,,,,\n");

        $res = $this->post('/api/admin/bulk-import/questions', ['file' => $file, 'dry_run' => '1'])->assertOk();

        $res->assertJson(['total_rows' => 6, 'created' => 1, 'error_count' => 5]);
        $errors = implode("\n", $res->json('errors'));
        foreach (['correct_option "F"', 'exam_code "UPSC" not found', 'difficulty "super"', 'chapter_name_en needs subject_name_en', 'marks "two"'] as $fragment) {
            $this->assertStringContainsString($fragment, $errors);
        }
    }

    public function test_existing_questions_are_reused_not_duplicated(): void
    {
        $existing = $this->question(text: 'Who founded the Maurya Empire?');
        $file = $this->csv(self::HEADER
            . "  who founded the   Maurya empire?  ,,A,B,C,D,A,,,,,,,,\n"
            . "Brand new question?,,A,B,C,D,A,,,,,,,,\n"
            . "Brand new question?,,A,B,C,D,B,,,,,,,,\n"); // in-file duplicate

        $res = $this->post('/api/admin/bulk-import/questions', [
            'file' => $file, 'dry_run' => '0', 'test_name' => 'Reuse Test', 'duration_min' => '10',
        ])->assertCreated();

        $res->assertJson(['created' => 1, 'skipped' => 1, 'error_count' => 1, 'question_count' => 2]);
        $this->assertSame(2, Question::count());
        $test = Test::findOrFail($res->json('test_id'));
        $this->assertTrue($test->questions->pluck('id')->contains($existing->id));
    }

    public function test_import_can_create_a_test_with_marks_written_to_the_pivot(): void
    {
        $file = $this->csv(self::HEADER
            . "Q1?,,A,B,C,D,A,,,,,,,,\n"
            . "Q2?,,A,B,C,D,B,,,,,,,3,1\n");

        $res = $this->post('/api/admin/bulk-import/questions', [
            'file' => $file, 'dry_run' => '0', 'test_name' => 'Imported Mock', 'duration_min' => '45',
            'question_mark' => '2', 'negative_marking' => '0.5', 'is_published' => '1', 'exam_code' => 'BPSC',
        ])->assertCreated();

        $test = Test::findOrFail($res->json('test_id'));
        $this->assertSame('published', $test->status);
        $this->assertSame(2700, (int) $test->duration_sec);
        $this->assertEquals(5.0, (float) $test->total_marks);

        $pivot = DB::table('question_test')->where('test_id', $test->id)->orderBy('sort_order')->get();
        $this->assertSame(['Q1?', 'Q2?'], Question::whereIn('id', $pivot->pluck('question_id'))->orderBy('id')->pluck('question_en')->all());
        $this->assertEquals([2.0, 3.0], $pivot->pluck('marks')->map(fn ($m) => (float) $m)->all());
        $this->assertEquals([0.5, 1.0], $pivot->pluck('negative_marks')->map(fn ($m) => (float) $m)->all());

        // Imported test is immediately takeable and scores with those marks.
        $this->actingAsStudent();
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->assertOk()->json('attempt.id');
        $score = $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']], // +2
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => $key[1]['wrong']],   // -1
        ]])->assertOk()->json('total_score');
        $this->assertEquals(1.0, (float) $score);
    }

    public function test_xlsx_upload_with_hindi_sparse_cells_and_numeric_answers(): void
    {
        $file = $this->xlsx([
            ['Question', 'Question Hindi', 'Option A', 'Option B', 'Option C', 'Option D', 'Answer', 'Subject'],
            ['What is 1+1?', 'एक और एक?', 2, 3, 4, 5, 1, 'Mathematics'],
            [], // blank row in the middle
            ['Sparse row?', null, 'Yes', 'No', null, null, 'B', null],
        ]);

        $res = $this->post('/api/admin/bulk-import/questions', ['file' => $file, 'dry_run' => '0', 'exam_code' => 'BPSC'])
            ->assertCreated()->assertJson(['total_rows' => 2, 'created' => 2, 'error_count' => 0]);

        $q = Question::where('question_en', 'What is 1+1?')->with('options')->firstOrFail();
        $this->assertSame('एक और एक?', $q->question_hi);
        $this->assertSame('2', $q->options->firstWhere('is_correct', true)->option_en);
        $sparse = Question::where('question_en', 'Sparse row?')->with('options')->firstOrFail();
        $this->assertCount(2, $sparse->options);
        $this->assertSame('No', $sparse->options->firstWhere('is_correct', true)->option_en);
        $this->assertNotNull($res->json('sample_questions'));
    }

    public function test_windows_1252_csv_is_converted_to_utf8(): void
    {
        $content = mb_convert_encoding(self::HEADER . "Café au lait?,,Oui,Non,,,A,,,,,,,,\n", 'Windows-1252', 'UTF-8');

        $this->post('/api/admin/bulk-import/questions', ['file' => $this->csv($content), 'dry_run' => '0'])->assertCreated();

        $this->assertSame(1, Question::where('question_en', 'Café au lait?')->count());
    }

    public function test_rejects_unsupported_files(): void
    {
        $this->post('/api/admin/bulk-import/questions', ['file' => UploadedFile::fake()->createWithContent('old.xls', 'junk')])
            ->assertStatus(422)->assertJsonFragment(['message' => 'Old .xls files are not supported. Open the file in Excel and "Save As" .xlsx or "CSV UTF-8".']);
        $this->post('/api/admin/bulk-import/questions', ['file' => UploadedFile::fake()->createWithContent('q.pdf', 'junk')])
            ->assertStatus(422);
        $this->post('/api/admin/bulk-import/questions', ['file' => $this->csv(self::HEADER)])
            ->assertStatus(422);
    }

    public function test_non_admins_are_forbidden(): void
    {
        $this->actingAsStudent();
        $this->post('/api/admin/bulk-import/questions', ['file' => $this->csv(self::HEADER . "Q?,,A,B,,,A,,,,,,,,\n")])->assertForbidden();
        $this->get('/api/admin/bulk-import/template/questions')->assertForbidden();
    }

    // ─── Syllabus ─────────────────────────────────────────────────────────────

    public function test_syllabus_import_resolves_parents_in_any_row_order_and_skips_existing(): void
    {
        $file = $this->csv("type,exam_code,name_en,name_hi,code,category,sort_order,parent_name_en\n"
            . "topic,BPSC,Kosi,,,,1,Rivers of Bihar\n"
            . "chapter,BPSC,Rivers of Bihar,,,,1,Geography\n"
            . "subject,BPSC,Geography,भूगोल,GEO,GS,1,\n"
            . "chapter,BPSC,Orphan,,,,1,No Such Subject\n");

        $dry = $this->post('/api/admin/bulk-import/syllabus', ['file' => $file, 'dry_run' => '1'])->assertOk();
        $dry->assertJson(['created' => 3, 'error_count' => 1]);
        $this->assertSame(0, Subject::where('name_en', 'Geography')->count());

        $this->post('/api/admin/bulk-import/syllabus', ['file' => $file, 'dry_run' => '0'])->assertOk()->assertJson(['created' => 3]);
        $geo = Subject::where('name_en', 'Geography')->firstOrFail();
        $this->assertSame('भूगोल', $geo->name_hi);
        $chapter = Chapter::where('subject_id', $geo->id)->where('name_en', 'Rivers of Bihar')->firstOrFail();
        $this->assertSame(1, Topic::where('chapter_id', $chapter->id)->where('name_en', 'Kosi')->count());

        $this->post('/api/admin/bulk-import/syllabus', ['file' => $file, 'dry_run' => '0'])->assertOk()->assertJson(['created' => 0, 'skipped' => 3]);
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    public function test_tests_import_builds_sections_from_criteria_and_ids(): void
    {
        $exam = $this->exam('BPSC');
        $history = $this->subject($exam, 'History');
        for ($i = 0; $i < 6; $i++) {
            $this->question($history);
        }
        $fixed = [$this->question()->id, $this->question()->id];

        $file = $this->csv("type,name_en,exam_code,series_name,mode,status,duration_min,question_mark,negative_marking,section_name,subject_name_en,chapter_name_en,difficulty,count,ids\n"
            . "TEST,CSV Mock,BPSC,Batch 1,mock,published,90,1,0.25,,,,,,\n"
            . "SECTION,,,,,,,2,0.5,History,,,,,\n"
            . "CRITERIA,,,,,,,,,,History,,,4,\n"
            . "SECTION,,,,,,,,,Fixed,,,,,\n"
            . "Q_IDS,,,,,,,,,,,,,,\"{$fixed[0]},{$fixed[1]},99999\"\n");

        $dry = $this->post('/api/admin/bulk-import/tests', ['file' => $file, 'dry_run' => '1'])->assertOk();
        $dry->assertJson(['question_count' => 6, 'sections_count' => 2, 'error_count' => 1]);
        $this->assertSame(0, Test::where('name_en', 'CSV Mock')->count());

        $res = $this->post('/api/admin/bulk-import/tests', ['file' => $file, 'dry_run' => '0'])->assertCreated();
        $test = Test::findOrFail($res->json('test_id'));
        $this->assertSame('published', $test->status);
        $this->assertSame(5400, (int) $test->duration_sec);

        $pivot = DB::table('question_test')->where('test_id', $test->id)->orderBy('sort_order')->get();
        $this->assertCount(6, $pivot);
        // Section marks on the first 4, test defaults on the fixed ones.
        $this->assertEquals([2, 2, 2, 2, 1, 1], $pivot->pluck('marks')->map(fn ($m) => (float) $m)->all());
        $this->assertEquals([0.5, 0.5, 0.5, 0.5, 0.25, 0.25], $pivot->pluck('negative_marks')->map(fn ($m) => (float) $m)->all());
        $this->assertSame($fixed, $pivot->slice(4)->pluck('question_id')->map(fn ($id) => (int) $id)->values()->all());
        $this->assertEquals(10.0, (float) $test->total_marks);
        $this->assertSame(1, DB::table('test_series_tests')->where('test_id', $test->id)->count());
    }

    public function test_tests_import_requires_a_test_row(): void
    {
        $file = $this->csv("type,name_en,ids\nQ_IDS,,1\n");
        $this->post('/api/admin/bulk-import/tests', ['file' => $file, 'dry_run' => '1'])->assertStatus(422);
    }
}
