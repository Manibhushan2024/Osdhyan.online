<?php

use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Payments module — Razorpay checkout for paid test series
|--------------------------------------------------------------------------
| Required (auto-loaded) by routes/api.php, so every path below lives under
| the /api prefix. Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
| RAZORPAY_WEBHOOK_SECRET, PAYMENTS_FAKE (local dev only).
*/

// Razorpay → server. No auth; the HMAC signature is the authentication.
// Register https://<api-host>/api/webhooks/razorpay in the Razorpay dashboard
// with events payment.captured, payment.failed and order.paid.
Route::post('/webhooks/razorpay', [PaymentController::class, 'webhook'])
    ->middleware('throttle:60,1')
    ->name('payments.webhook.razorpay');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/payments/config', [PaymentController::class, 'config']);
    Route::post('/payments/verify', [PaymentController::class, 'verify']);

    Route::post('/test-series/{series}/checkout', [PaymentController::class, 'checkout']);

    Route::get('/orders', [PaymentController::class, 'myOrders']);
    Route::get('/orders/{id}', [PaymentController::class, 'showOrder'])->whereNumber('id');

    Route::middleware('admin')->group(function () {
        Route::get('/admin/orders/summary', [AdminOrderController::class, 'summary']);
        Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    });
});
