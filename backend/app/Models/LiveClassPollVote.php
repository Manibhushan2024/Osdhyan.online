<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveClassPollVote extends Model
{
    protected $fillable = ['poll_id', 'user_id', 'option_id'];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(LiveClassPoll::class, 'poll_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
