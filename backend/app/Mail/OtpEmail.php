<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $name,
        public readonly string $otp,
        public readonly string $purpose = 'login'   // login | reset
    ) {
        $this->onQueue('mail');
    }

    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'reset'
            ? 'Your OSDHYAN Password Reset OTP'
            : 'Your OSDHYAN Login OTP';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'name'    => $this->name,
                'otp'     => $this->otp,
                'purpose' => $this->purpose,
                'expiry'  => $this->purpose === 'reset' ? '10 minutes' : '5 minutes',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
