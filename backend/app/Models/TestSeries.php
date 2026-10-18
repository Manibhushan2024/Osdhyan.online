<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestSeries extends Model
{
    protected $fillable = [
        'exam_id', 'name_en', 'name_hi',
        'description_en', 'description_hi',
        'category', 'is_published', 'image',
        'price', 'mrp', 'currency', 'is_paid', 'validity_days',
    ];

    protected $casts = [
        'is_published'  => 'boolean',
        'is_paid'       => 'boolean',
        'price'         => 'decimal:2',
        'mrp'           => 'decimal:2',
        'validity_days' => 'integer',
    ];

    protected $attributes = [
        'price'    => 0,
        'currency' => 'INR',
        'is_paid'  => false,
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function tests()
    {
        return $this->belongsToMany(Test::class, 'test_series_tests');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_test_series')
            ->withPivot(['access_expires_at', 'order_id']);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // ─── Pricing helpers ─────────────────────────────────────────────────────

    /** A series costs money only when flagged paid AND priced above zero. */
    public function requiresPayment(): bool
    {
        return (bool) $this->is_paid && $this->priceInPaise() > 0;
    }

    /** Price in the smallest currency unit (paise for INR). */
    public function priceInPaise(): int
    {
        return (int) round(((float) ($this->price ?? 0)) * 100);
    }

    public function currencyCode(): string
    {
        return strtoupper((string) ($this->currency ?: 'INR'));
    }

    /** When access bought now would end; null = lifetime. */
    public function accessExpiryFromNow(): ?\Illuminate\Support\Carbon
    {
        $days = (int) ($this->validity_days ?? 0);

        return $days > 0 ? now()->addDays($days) : null;
    }
}
