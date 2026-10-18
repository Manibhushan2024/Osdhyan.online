<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Bulk student accounts for LOAD TESTING ONLY (scripts/load_test.py).
 * Refuses to run in production.
 *
 *   LOADTEST_USERS=10000 php artisan db:seed --class=LoadTestUsersSeeder
 *
 * Accounts: loadtest1@example.test … loadtestN@example.test / LoadTest@123
 */
class LoadTestUsersSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->error('LoadTestUsersSeeder must not run in production.');
            return;
        }

        $count = (int) env('LOADTEST_USERS', 1000);
        $hash = Hash::make('LoadTest@123'); // one hash, reused — seeding stays fast
        $now = now();

        for ($start = 1; $start <= $count; $start += 1000) {
            $rows = [];
            for ($i = $start; $i < min($start + 1000, $count + 1); $i++) {
                $rows[] = [
                    'name'       => "Load Test {$i}",
                    'email'      => "loadtest{$i}@example.test",
                    'phone'      => (string) (8000000000 + $i),
                    'password'   => $hash,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            DB::table('users')->upsert($rows, ['email'], ['password', 'updated_at']);
        }

        $this->command?->info("Seeded {$count} load-test users (loadtestN@example.test).");
    }
}
