<?php

namespace App\Console\Commands;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Services\AttemptScorer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Auto-submit attempts whose time (plus grace) has run out, e.g. students who
 * closed the tab. Scores whatever answers were saved, so results, stats and
 * leaderboards don't depend on the student coming back.
 */
class FinalizeExpiredAttempts extends Command
{
    protected $signature = 'attempts:finalize-expired {--limit=2000}';

    protected $description = 'Score and close test attempts whose time limit has passed';

    public function handle(): int
    {
        $grace = TestAttempt::GRACE_SEC;
        $driver = DB::getDriverName();
        $expiry = $driver === 'pgsql'
            ? "COALESCE(test_attempts.started_at, test_attempts.created_at) + (tests.duration_sec + {$grace}) * INTERVAL '1 second' < NOW()"
            : "datetime(COALESCE(test_attempts.started_at, test_attempts.created_at), '+' || (tests.duration_sec + {$grace}) || ' seconds') < datetime('now')";

        $ids = TestAttempt::query()
            ->join('tests', 'tests.id', '=', 'test_attempts.test_id')
            ->whereIn('test_attempts.status', ['ongoing', 'in_progress'])
            ->whereRaw($expiry)
            ->limit((int) $this->option('limit'))
            ->pluck('test_attempts.id');

        $tests = [];
        $done = 0;
        foreach ($ids as $id) {
            $attempt = TestAttempt::find($id);
            if (!$attempt) {
                continue;
            }
            $test = $tests[$attempt->test_id] ??= Test::find($attempt->test_id);
            if ($test) {
                AttemptScorer::finalize($attempt, $test);
                $done++;
            }
        }

        $this->info("Finalized {$done} expired attempt(s).");

        return self::SUCCESS;
    }
}
