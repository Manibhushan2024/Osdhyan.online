<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\TestSeries;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status'         => 'nullable|in:pending,paid,failed,refunded',
            'test_series_id' => 'nullable|integer',
            'provider'       => 'nullable|in:razorpay,fake',
            'from'           => 'nullable|date',
            'to'             => 'nullable|date',
            'q'              => 'nullable|string|max:100',
            'per_page'       => 'nullable|integer|min:5|max:100',
        ]);

        $query = Order::query()
            ->with([
                'user:id,name,email,phone',
                'testSeries:id,name_en,is_paid,price,currency',
            ])
            ->latest('id');

        if (!empty($data['status'])) {
            $query->where('status', $data['status']);
        }
        if (!empty($data['test_series_id'])) {
            $query->where('test_series_id', $data['test_series_id']);
        }
        if (!empty($data['provider'])) {
            $query->where('provider', $data['provider']);
        }
        if (!empty($data['from'])) {
            $query->where('created_at', '>=', Carbon::parse($data['from'])->startOfDay());
        }
        if (!empty($data['to'])) {
            $query->where('created_at', '<=', Carbon::parse($data['to'])->endOfDay());
        }
        if (!empty($data['q'])) {
            $term = '%' . $data['q'] . '%';
            $query->where(function ($q) use ($term, $data) {
                $q->where('provider_order_id', 'like', $term)
                    ->orWhere('provider_payment_id', 'like', $term)
                    ->orWhereHas('user', fn ($u) => $u->where('email', 'like', $term)
                        ->orWhere('name', 'like', $term)
                        ->orWhere('phone', 'like', $term));
                if (ctype_digit($data['q'])) {
                    $q->orWhere('id', (int) $data['q']);
                }
            });
        }

        return response()->json($query->paginate((int) ($data['per_page'] ?? 25)));
    }

    public function summary(): JsonResponse
    {
        $paid = fn () => Order::query()->paid();

        $revenue = [
            'today' => (int) $paid()->where('paid_at', '>=', now()->startOfDay())->sum('amount'),
            '7d'    => (int) $paid()->where('paid_at', '>=', now()->subDays(7))->sum('amount'),
            '30d'   => (int) $paid()->where('paid_at', '>=', now()->subDays(30))->sum('amount'),
            'total' => (int) $paid()->sum('amount'),
        ];

        $counts = Order::query()
            ->select('status', DB::raw('count(*) as c'))
            ->groupBy('status')
            ->pluck('c', 'status');

        $bySeries = Order::query()
            ->paid()
            ->select('test_series_id', DB::raw('count(*) as orders_count'), DB::raw('sum(amount) as revenue'))
            ->groupBy('test_series_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $names = TestSeries::query()
            ->whereIn('id', $bySeries->pluck('test_series_id'))
            ->pluck('name_en', 'id');

        return response()->json([
            'currency'      => 'INR',
            'revenue'       => $revenue, // paise
            'revenue_rupees' => array_map(fn ($v) => round($v / 100, 2), $revenue),
            'paid_count'    => (int) ($counts['paid'] ?? 0),
            'pending_count' => (int) ($counts['pending'] ?? 0),
            'failed_count'  => (int) ($counts['failed'] ?? 0),
            'refunded_count' => (int) ($counts['refunded'] ?? 0),
            'paid_today'    => (int) $paid()->where('paid_at', '>=', now()->startOfDay())->count(),
            'test_mode_orders' => (int) Order::query()->where('provider', Order::PROVIDER_FAKE)->count(),
            'by_series'     => $bySeries->map(fn ($row) => [
                'test_series_id' => (int) $row->test_series_id,
                'name'           => $names[$row->test_series_id] ?? ('Series #' . $row->test_series_id),
                'orders_count'   => (int) $row->orders_count,
                'revenue'        => (int) $row->revenue,
                'revenue_rupees' => round(((int) $row->revenue) / 100, 2),
            ])->values(),
        ]);
    }
}
