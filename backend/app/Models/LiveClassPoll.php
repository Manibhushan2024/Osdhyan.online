<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveClassPoll extends Model
{
    protected $fillable = ['live_class_id', 'question', 'options', 'is_open', 'revealed_at'];

    protected $casts = [
        'options'     => 'array',
        'is_open'     => 'boolean',
        'revealed_at' => 'datetime',
    ];

    public function liveClass(): BelongsTo
    {
        return $this->belongsTo(LiveClass::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(LiveClassPollVote::class, 'poll_id');
    }

    public function hasOption(string $optionId): bool
    {
        foreach ($this->options ?? [] as $opt) {
            if ((string) ($opt['id'] ?? '') === $optionId) {
                return true;
            }
        }

        return false;
    }

    /** @return array<string,int> option_id => votes */
    public function voteCounts(): array
    {
        $counts = [];
        foreach ($this->options ?? [] as $opt) {
            $counts[(string) $opt['id']] = 0;
        }
        $rows = $this->votes()
            ->selectRaw('option_id, count(*) as c')
            ->groupBy('option_id')
            ->pluck('c', 'option_id');
        foreach ($rows as $optionId => $c) {
            $counts[(string) $optionId] = (int) $c;
        }

        return $counts;
    }

    /**
     * @param bool $withResults include per-option counts (teacher always,
     *                          students only after reveal)
     */
    public function toStateArray(bool $withResults): array
    {
        $out = [
            'id'          => $this->id,
            'question'    => $this->question,
            'options'     => $this->options ?? [],
            'is_open'     => $this->is_open,
            'revealed_at' => $this->revealed_at?->toISOString(),
            'created_at'  => $this->created_at?->toISOString(),
            'total_votes' => $this->votes()->count(),
            'results'     => null,
        ];
        if ($withResults || $this->revealed_at !== null) {
            $out['results'] = $this->voteCounts();
        }

        return $out;
    }
}
