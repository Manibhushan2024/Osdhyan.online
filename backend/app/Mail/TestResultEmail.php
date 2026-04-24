<?php

namespace App\Mail;

use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TestResultEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User        $user,
        public readonly TestAttempt $attempt
    ) {
        $this->onQueue('mail');
    }

    public function envelope(): Envelope
    {
        $testName = $this->attempt->test?->name_en ?? 'Test';
        return new Envelope(
            subject: "Your Result: {$testName} — OSDHYAN",
        );
    }

    public function content(): Content
    {
        $attempt  = $this->attempt;
        $metadata = $attempt->metadata ?? [];
        $test     = $attempt->test;

        $correctCount   = data_get($metadata, 'correct_count', 0);
        $incorrectCount = data_get($metadata, 'incorrect_count', 0);
        $accuracy       = data_get($metadata, 'accuracy', 0);
        $totalQuestions = ($correctCount + $incorrectCount + ($attempt->responses?->count() ?? 0));

        return new Content(
            view: 'emails.test_result',
            with: [
                'name'          => $this->user->name,
                'testName'      => $test?->name_en ?? 'Test',
                'totalScore'    => $attempt->total_score ?? 0,
                'totalMarks'    => $test?->total_marks ?? 0,
                'accuracy'      => round((float) $accuracy, 1),
                'correctCount'  => $correctCount,
                'incorrectCount'=> $incorrectCount,
                'timeTaken'     => $this->formatTime((int) ($attempt->time_taken_sec ?? 0)),
                'resultUrl'     => rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/') . "/dashboard/tests/result/{$attempt->id}",
                'solutionsUrl'  => rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/') . "/dashboard/tests/solutions/{$attempt->id}",
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }

    private function formatTime(int $seconds): string
    {
        $h = intdiv($seconds, 3600);
        $m = intdiv($seconds % 3600, 60);
        $s = $seconds % 60;

        if ($h > 0) {
            return sprintf('%dh %dm %ds', $h, $m, $s);
        }

        return sprintf('%dm %ds', $m, $s);
    }
}
