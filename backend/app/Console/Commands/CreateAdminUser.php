<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    protected $signature = 'admin:create
                            {--name=Admin : Display name}
                            {--email= : Email address (required)}
                            {--password= : Password (required)}
                            {--phone= : Phone number}
                            {--admin-role=root : Admin role: root or editor}';

    protected $description = 'Create or update an admin user';

    public function handle(): int
    {
        $email = $this->option('email');
        $password = $this->option('password');

        if (!$email || !$password) {
            $this->error('--email and --password are required.');
            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'       => $this->option('name'),
                'phone'      => $this->option('phone') ?: null,
                'password'   => Hash::make($password),
                'is_admin'   => true,
                'admin_role' => $this->option('admin-role'),
            ]
        );

        $this->info("Admin user {$user->email} created/updated successfully (ID: {$user->id}, role: {$user->admin_role}).");

        return self::SUCCESS;
    }
}
