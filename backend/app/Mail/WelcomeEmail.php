<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly User $user)
    {
        $this->onQueue('mail');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to OSDHYAN — Your Preparation Begins Now',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'name'          => $this->user->name,
                'exam'          => $this->user->exam_preference ?? 'your target exam',
                'loginUrl'      => rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/') . '/auth/login',
                'dashboardUrl'  => rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/') . '/dashboard',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
