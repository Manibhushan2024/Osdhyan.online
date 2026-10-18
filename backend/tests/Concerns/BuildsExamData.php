<?php

namespace Tests\Concerns;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

/**
 * Small, explicit builders for exam data. Kept as plain helpers (not
 * factories) so each test shows exactly the marks/options it relies on.
 */
trait BuildsExamData
{
    protected function exam(string $code = 'BPSC'): Exam
    {
        return Exam::firstOrCreate(
            ['slug' => strtolower($code)],
            ['name_en' => "{$code} Exam", 'code' => $code]
        );
    }

    protected function subject(Exam $exam, string $name = 'History'): Subject
    {
        return Subject::firstOrCreate(
            ['exam_id' => $exam->id, 'name_en' => $name],
            ['slug' => Str::slug($exam->code . ' ' . $name) . '-' . Str::random(4)]
        );
    }

    /** A 4-option MCQ whose correct answer is option A unless $correct says otherwise. */
    protected function question(?Subject $subject = null, int $correct = 0, string $text = null): Question
    {
        $q = Question::create([
            'subject_id'     => $subject?->id,
            'question_en'    => $text ?? 'Question ' . Str::random(8),
            'question_hi'    => 'प्रश्न',
            'explanation_en' => 'Because reasons.',
            'difficulty'     => 'medium',
        ]);
        foreach (['A', 'B', 'C', 'D'] as $i => $label) {
            $q->options()->create([
                'label'      => $label,
                'option_en'  => "Option {$label}",
                'is_correct' => $i === $correct,
            ]);
        }

        return $q->load('options');
    }

    /**
     * A test with $count questions. Questions are attached through the
     * production helper so pivot marks/negative_marks are written as the
     * admin panel would write them.
     */
    protected function makeTest(
        int $count = 5,
        float $mark = 1,
        float $negative = 0.25,
        string $status = 'published',
        int $durationSec = 600,
        array $attributes = [],
        ?Subject $subject = null,
    ): Test {
        $subject ??= $this->subject($this->exam());
        $test = Test::create(array_merge([
            'exam_id'          => $subject->exam_id,
            'name_en'          => 'Mock ' . Str::random(5),
            'mode'             => 'mock',
            'status'           => $status,
            'duration_sec'     => $durationSec,
            'question_mark'    => $mark,
            'negative_marking' => $negative,
            'total_marks'      => 0,
        ], $attributes));

        $ids = [];
        for ($i = 0; $i < $count; $i++) {
            $ids[] = $this->question($subject)->id;
        }
        $test->replaceQuestions($ids);
        $test->refreshTotalMarks();

        return $test->fresh();
    }

    /** @return array<int, array{question_id:int, correct:int, wrong:int}> in test order */
    protected function answerKey(Test $test): array
    {
        return $test->questions()->with('options')->get()->map(fn ($q) => [
            'question_id' => $q->id,
            'correct'     => $q->options->firstWhere('is_correct', true)->id,
            'wrong'       => $q->options->firstWhere('is_correct', false)->id,
        ])->all();
    }

    protected function student(array $attributes = []): User
    {
        return User::create(array_merge([
            'name'     => 'Student ' . Str::random(4),
            'email'    => Str::lower(Str::random(10)) . '@example.test',
            'phone'    => '9' . random_int(100000000, 999999999),
            'password' => Hash::make('Secret@123'),
        ], $attributes));
    }

    protected function admin(string $role = 'root'): User
    {
        return $this->student(['is_admin' => true, 'admin_role' => $role]);
    }

    protected function actingAsStudent(?User $user = null): User
    {
        $user ??= $this->student();
        Sanctum::actingAs($user);

        return $user;
    }
}
