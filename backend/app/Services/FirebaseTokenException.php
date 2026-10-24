<?php

namespace App\Services;

use RuntimeException;

/** A Firebase ID token was rejected; status() is the HTTP status to answer with. */
class FirebaseTokenException extends RuntimeException
{
    public function __construct(string $message, private int $status = 401)
    {
        parent::__construct($message);
    }

    public function status(): int
    {
        return $this->status;
    }
}
