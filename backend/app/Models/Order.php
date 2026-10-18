<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * One purchase attempt of a test series. `amount` is in paise.
 */
class Order extends Model
{
    public const STATUS_PENDING  = 'pending';
    public const STATUS_PAID     = 'paid';
    public const STATUS_FAILED   = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    public const PROVIDER_RAZORPAY = 'razorpay';
    public const PROVIDER_FAKE     = 'fake';

    protected $fillable = [
        'user_id', 'test_series_id', 'amount', 'currency', 'status', 'provider',
        'provider_order_id', 'provider_payment_id', 'provider_signature',
        'paid_at', 'expires_at', 'failure_reason', 'metadata',
    ];

    protected $casts = [
        'amount'     => 'integer',
        'paid_at'    => 'datetime',
        'expires_at' => 'datetime',
        'metadata'   => 'array',
    ];

    protected $hidden = ['provider_signature'];

    protected $appends = ['amount_rupees', 'is_test_mode'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function testSeries()
    {
        return $this->belongsTo(TestSeries::class);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PAID);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function getAmountRupeesAttribute(): float
    {
        return round(((int) $this->amount) / 100, 2);
    }

    public function getIsTestModeAttribute(): bool
    {
        return $this->provider === self::PROVIDER_FAKE;
    }
}
