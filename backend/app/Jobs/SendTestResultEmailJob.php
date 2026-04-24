<?php

namespace App\Jobs;

use App\Mail\TestResultEmail;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendTestResultEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;
    public int $tries   = 5;
    public int $backoff = 30;

    public function __construct(
        public readonly int $userId,
        public readonly int $attemptId
    ) {
        $this->onQueue('mail');
    }

    public function handle(): void
    {
        $user = User::find($this->userId);
        if (!$user || empty($user->email)) {
            return;
        }

        $attempt = TestAttempt::with('test')->find($this->attemptId);
        if (!$attempt) {
            return;
        }

        try {
            Mail::to($user->email)->send(new TestResultEmail($user, $attempt));
        } catch (\Throwable $e) {
            Log::error('SendTestResultEmailJob failed', [
                'user_id'    => $this->userId,
                'attempt_id' => $this->attemptId,
                'error'      => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
