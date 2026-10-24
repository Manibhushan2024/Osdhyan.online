<?php

namespace App\Console\Commands;

use App\Mail\OtpEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Sends a real OTP-style e-mail so the owner can confirm that MAIL_* settings
 * deliver before students depend on e-mail sign-in codes.
 *
 *   php artisan osdhyan:mail-test you@example.com
 */
class MailTest extends Command
{
    protected $signature = 'osdhyan:mail-test {to : Address that should receive the test e-mail}';

    protected $description = 'Send a test sign-in e-mail with the current MAIL_* settings';

    public function handle(): int
    {
        $mailer = config('mail.default');
        $this->line("Mailer: {$mailer}" . ($mailer === 'smtp' ? ' (' . config('mail.mailers.smtp.host') . ':' . config('mail.mailers.smtp.port') . ')' : ''));
        $this->line('From:   ' . config('mail.from.address'));

        if (in_array($mailer, ['log', 'array'], true)) {
            $this->error("MAIL_MAILER={$mailer} never delivers. Set MAIL_MAILER=smtp (Gmail/Brevo) or resend with a valid key, then: php artisan config:cache");
            return self::FAILURE;
        }

        try {
            Mail::to($this->argument('to'))->sendNow(new OtpEmail('there', '123456', 'login'));
        } catch (\Throwable $e) {
            $this->error('Sending failed: ' . $e->getMessage());
            $this->line('Check MAIL_HOST / MAIL_PORT / MAIL_USERNAME / MAIL_PASSWORD (Gmail needs an App Password) and run php artisan config:cache after editing .env.');
            return self::FAILURE;
        }

        $this->info('Sent. Check the inbox (and spam) of ' . $this->argument('to') . ' for the code 123456.');
        return self::SUCCESS;
    }
}
