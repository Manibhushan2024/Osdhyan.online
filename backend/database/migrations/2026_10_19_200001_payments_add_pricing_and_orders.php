<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Paid test series: pricing columns on test_series and the orders ledger.
 * Amounts in `orders` are stored in the smallest currency unit (paise).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('test_series', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('image');
            $table->decimal('mrp', 10, 2)->nullable()->after('price');
            $table->char('currency', 3)->default('INR')->after('mrp');
            $table->boolean('is_paid')->default(false)->index()->after('currency');
            $table->unsignedInteger('validity_days')->nullable()->after('is_paid');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_series_id')->constrained('test_series')->cascadeOnDelete();
            $table->unsignedBigInteger('amount'); // paise
            $table->char('currency', 3)->default('INR');
            $table->string('status', 20)->default('pending'); // pending|paid|failed|refunded
            $table->string('provider', 20)->default('razorpay'); // razorpay|fake
            $table->string('provider_order_id')->nullable()->unique();
            $table->string('provider_payment_id')->nullable()->index();
            $table->string('provider_signature')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // access end, null = lifetime
            $table->string('failure_reason', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['test_series_id', 'status']);
            $table->index(['status', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');

        Schema::table('test_series', function (Blueprint $table) {
            $table->dropColumn(['price', 'mrp', 'currency', 'is_paid', 'validity_days']);
        });
    }
};
