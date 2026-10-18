<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo accounts for LOCAL development / QA only. Refuses to run in production.
 *
 *   php artisan db:seed --class=LocalDevUsersSeeder
 *
 * Student: student@local.test / Student@123   (phone 9000000002)
 * Admin:   admin@local.test   / LocalAdmin@123 (root admin, phone 9000000001)
 */
class LocalDevUsersSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->error('LocalDevUsersSeeder must not run in production.');
            return;
        }

        User::updateOrCreate(['email' => 'student@local.test'], [
            'name'     => 'Demo Student',
            'phone'    => '9000000002',
            'password' => Hash::make('Student@123'),
            'is_admin' => false,
        ]);

        User::updateOrCreate(['email' => 'admin@local.test'], [
            'name'       => 'Local Admin',
            'phone'      => '9000000001',
            'password'   => Hash::make('LocalAdmin@123'),
            'is_admin'   => true,
            'admin_role' => 'root',
        ]);

        $this->command?->info('Seeded student@local.test and admin@local.test (see class docblock for passwords).');
    }
}
