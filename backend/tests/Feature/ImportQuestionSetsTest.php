<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\StudyMaterial;
use App\Models\Test;
use App\Models\TestSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportQuestionSetsTest extends TestCase
{
    use RefreshDatabase;

    private function q(string $text, array $options, int $answer = 0, array $extra = []): array
    {
        return array_merge([
            'category'       => 'Reasoning',
            'question_en'    => $text,
            'question_hi'    => null,
            'options'        => array_map(fn ($o) => ['en' => $o, 'hi' => null], $options),
            'answer_index'   => $answer,
            'explanation_en' => 'Because.',
        ], $extra);
    }

    private function runSpec(array $tests, array $materials = []): void
    {
        $spec = ['exams' => [[
            'name_en'   => 'DSSSB TGT Computer Science',
            'slug'      => 'dsssb-tgt-cs',
            'code'      => 'DSSSB_TGT_CS',
            'materials' => $materials,
            'series'    => [[
                'name_en' => 'DSSSB TGT CS 2026 — Complete Test Series',
                'mode'    => 'mock',
                'tests'   => $tests,
            ]],
        ]]];
        $path = tempnam(sys_get_temp_dir(), 'qs') . '.json';
        file_put_contents($path, json_encode($spec));

        $this->artisan('osdhyan:import-question-sets', ['file' => $path])->assertSuccessful();
        @unlink($path);
    }

    public function test_same_stem_with_different_options_stays_two_questions(): void
    {
        $stem = 'In the following, select the odd letters from the given alternatives.';
        $this->runSpec([[
            'title' => 'Official Paper 1', 'subject' => 'Reasoning', 'mode' => 'pyq', 'category' => 'Previous Year Papers',
            'questions' => [
                $this->q($stem, ['MKH', 'MPR', 'WUR', 'KIF'], 1),
                $this->q($stem, ['ABC', 'DEF', 'GHJ', 'KLM'], 2),
                $this->q('What is 5 - 5?', ['0', '1', '5', '10'], 0),
            ],
        ]]);

        $this->assertSame(3, Question::count());
        $test = Test::where('name_en', 'Official Paper 1')->firstOrFail();
        $this->assertSame(3, $test->questions()->count());
        $zero = Question::where('question_en', 'What is 5 - 5?')->firstOrFail()->options()->where('is_correct', true)->first();
        $this->assertSame('0', $zero->option_en); // "0" must not be treated as empty
        $this->assertSame('Previous Year Papers', $test->category);
    }

    public function test_reimport_reuses_identical_questions_and_shares_them_across_tests(): void
    {
        $q = $this->q('Which layer of the OSI model does a router work at?', ['Physical', 'Data link', 'Network', 'Transport'], 2,
            ['category' => 'Computer Science', 'chapter' => 'Computer Networks & Internet', 'difficulty' => 'easy']);
        $tests = [
            ['title' => 'Official Paper 1', 'subject' => 'Computer Science', 'mode' => 'pyq', 'category' => 'Previous Year Papers', 'questions' => [$q]],
            ['title' => 'Full Mock Test 1', 'subject' => 'Computer Science', 'mode' => 'full_mock', 'category' => 'Full Mock Tests', 'duration_min' => 120, 'questions' => [$q]],
        ];
        $this->runSpec($tests);
        $this->runSpec($tests); // idempotent

        $this->assertSame(1, Question::count());
        $question = Question::with('options', 'chapter')->first();
        $this->assertSame('Computer Networks & Internet', $question->chapter?->name_en);
        $this->assertSame('Network', $question->options->firstWhere('is_correct', true)->option_en);

        $series = TestSeries::where('name_en', 'DSSSB TGT CS 2026 — Complete Test Series')->firstOrFail();
        $this->assertSame(2, $series->tests()->count());
        $this->assertSame(7200, (int) Test::where('name_en', 'Full Mock Test 1')->value('duration_sec'));
    }

    public function test_materials_are_imported_once(): void
    {
        $material = ['title' => 'DSSSB TGT CS — Operating Systems (Revision Notes)', 'subject' => 'Computer Science',
            'chapter' => 'Operating Systems', 'description' => 'Notes', 'file_path' => 'materials/dsssb/cs_os.pdf', 'type' => 'pdf'];
        $test = ['title' => 'Chapter Test — Operating Systems', 'subject' => 'Computer Science', 'chapter' => 'Operating Systems',
            'mode' => 'chapter', 'category' => 'Chapter-wise Tests',
            'questions' => [$this->q('Which scheduling algorithm can starve long jobs?', ['FCFS', 'SJF', 'Round robin', 'FIFO'], 1, ['category' => 'Computer Science'])]];

        $this->runSpec([$test], [$material]);
        $this->runSpec([$test], [$material]);

        $this->assertSame(1, StudyMaterial::where('title', $material['title'])->count());
    }
}
