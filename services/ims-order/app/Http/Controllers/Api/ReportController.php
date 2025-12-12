<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Handle sale report requests
     * This is the MAIN function that does everything
     */
    protected InventoryService $inventoryService;

    public function __construct(
        InventoryService $inventoryService
    ) {
        $this->inventoryService = $inventoryService;
    }


    public function getReport(Request $request)
    {
        try {
            // 1. Determine date range
            $dateRange = $this->getDateRange($request);

            // 2. Get summary data
            $summary = $this->getSummary($dateRange['start_date'], $dateRange['end_date']);

            // 3. Get product sales
            $productSales = $this->getProductSales($dateRange['start_date'], $dateRange['end_date']);

            // 4. Get daily breakdown
            $dailyBreakdown = $this->getDailyBreakdown($dateRange['start_date'], $dateRange['end_date']);

            // 5. Return the report
            return response()->json([
                'success' => true,
                'report_type' => $dateRange['type'],
                'period' => [
                    'start_date' => $dateRange['start_date'],
                    'end_date' => $dateRange['end_date'],
                    'days' => $dateRange['days']
                ],
                'summary' => $summary,
                'product_sales' => $productSales,
                'daily_breakdown' => $dailyBreakdown,
                'generated_at' => now()->toDateTimeString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate sales report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determine date range based on request
     * This handles YOUR EXACT requirements:
     * - date=2025-12-08 → 1 day
     * - start_date=2025-12-01 → 7 days
     */
    private function getDateRange(Request $request): array
    {
        // If date parameter exists → Daily report
        if ($request->has('date')) {
            $date = $request->date;

            // Validate date format
            if (!$this->isValidDate($date)) {
                throw new \Exception('Invalid date format. Use YYYY-MM-DD');
            }

            return [
                'start_date' => $date,
                'end_date' => $date,
                'type' => 'daily',
                'days' => 1
            ];
        }

        // If start_date exists → Weekly report
        if ($request->has('start_date')) {
            $startDate = $request->start_date;

            // Validate date format
            if (!$this->isValidDate($startDate)) {
                throw new \Exception('Invalid start_date format. Use YYYY-MM-DD');
            }

            // Calculate end date (start_date + 6 days = 7 days total)
            $carbonStart = Carbon::parse($startDate);
            $endDate = $carbonStart->copy()->addDays(6)->format('Y-m-d');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'type' => 'weekly',
                'days' => 7
            ];
        }

        // No parameters provided → Return error
        throw new \Exception('Please provide either "date" or "start_date" parameter');
    }

    /**
     * Validate date format (YYYY-MM-DD)
     */
    private function isValidDate(string $date): bool
    {
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) &&
            strtotime($date) !== false;
    }

    /**
     * Get summary data (totals, counts, averages)
     */
    private function getSummary(string $startDate, string $endDate): array
    {
        // Convert to Carbon for date comparison
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Query for completed orders in date range
        $orders = Order::where('status', 'completed')
            ->whereBetween('order_date', [$start, $end])
            ->get();

        // Calculate totals
        $totalSales = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $uniqueCustomers = $orders->unique('customer_id')->count();

        // Get total items sold
        $totalItems = OrderItem::whereIn('order_id', $orders->pluck('id'))
            ->sum('quantity');

        return [
            'total_sales' => (float) $totalSales,
            'total_orders' => $totalOrders,
            'total_items_sold' => $totalItems,
            'unique_customers' => $uniqueCustomers,
            'average_order_value' => $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0,
            'average_items_per_order' => $totalOrders > 0 ? round($totalItems / $totalOrders, 2) : 0
        ];
    }

    /**
     * Get product sales data
     */
    private function getProductSales(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Get orders in date range
        $orderIds = Order::where('status', 'completed')
            ->whereBetween('order_date', [$start, $end])
            ->pluck('id');

        if ($orderIds->isEmpty()) {
            return [];
        }

        // Get product sales data
        $productSales = OrderItem::whereIn('order_id', $orderIds)
            ->select([
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_price) as total_sales'),
                DB::raw('COUNT(DISTINCT order_id) as order_count')
            ])
            ->groupBy('product_id')
            ->orderByDesc('total_sales')
            ->get();

        // --- Get product names using InventoryService ---
        if ($productSales->isNotEmpty()) {
            $productIds = $productSales->pluck('product_id')->unique()->values()->toArray();

            // Use the existing method from InventoryService
            $productNames = $this->inventoryService->getProductNamesInParallel($productIds);

            // Transform results with product names
            $productSales = $productSales->map(function ($item) use ($productNames) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $productNames[$item->product_id] ?? 'Unknown Product',
                    'total_quantity' => (int) $item->total_quantity,
                    'total_sales' => (float) $item->total_sales,
                    'order_count' => (int) $item->order_count,
                    'average_quantity_per_order' => $item->order_count > 0
                        ? round($item->total_quantity / $item->order_count, 2)
                        : 0
                ];
            })->toArray();
        } else {
            $productSales = [];
        }

        return $productSales;
    }

    /**
     * Get daily breakdown
     */
    private function getDailyBreakdown(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $dailyData = [];
        $currentDate = $start->copy();

        while ($currentDate <= $end) {
            $dateStr = $currentDate->format('Y-m-d');
            $dayStart = $currentDate->copy()->startOfDay();
            $dayEnd = $currentDate->copy()->endOfDay();

            // Get orders for this day
            $dayOrders = Order::where('status', 'completed')
                ->whereBetween('order_date', [$dayStart, $dayEnd])
                ->get();

            // Calculate day totals
            $daySales = $dayOrders->sum('total_amount');
            $dayOrdersCount = $dayOrders->count();

            // Get items sold for this day
            $dayItems = 0;
            if ($dayOrders->isNotEmpty()) {
                $dayItems = OrderItem::whereIn('order_id', $dayOrders->pluck('id'))
                    ->sum('quantity');
            }

            $dailyData[] = [
                'date' => $dateStr,
                'day_name' => $currentDate->format('l'), // Monday, Tuesday, etc.
                'sales' => (float) $daySales,
                'orders' => $dayOrdersCount,
                'items_sold' => $dayItems,
                'average_order_value' => $dayOrdersCount > 0
                    ? round($daySales / $dayOrdersCount, 2)
                    : 0
            ];

            $currentDate->addDay();
        }

        return $dailyData;
    }
}
