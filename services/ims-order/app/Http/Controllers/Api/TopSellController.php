<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\TopSaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class TopSellController extends Controller
{
    protected TopSaleService $topSaleService;

    public function __construct(TopSaleService $topSaleService)
    {
        $this->topSaleService = $topSaleService;
    }

    public function getTopSellingProducts(Request $request)
    {
        $startTime = microtime(true);

        try {
            // Get parameters
            $limit = $this->getValidLimit($request);
            $offset = $this->getValidOffset($request);
            $cacheKey = $this->generateCacheKey($limit, $offset);

            // Try cache first
            if ($cached = $this->getFromCache($cacheKey)) {
                $duration = round((microtime(true) - $startTime) * 1000, 2);
                return $this->jsonResponse($cached, true, $duration);
            }

            // 1. Get products with sales (sorted by sales quantity)
            $productSales = $this->getSoldProductsData($limit, $offset);

            if (empty($productSales)) {
                $duration = round((microtime(true) - $startTime) * 1000, 2);
                return $this->jsonResponse([
                    'success' => true,
                    'products' => [],
                    'total_count' => 0,
                    'total_sales' => 0,
                    'total_quantity' => 0,
                    'message' => 'No products with sales found'
                ], false, $duration);
            }

            // 2. Extract product IDs
            $soldProductIds = array_column($productSales, 'product_id');

            // 3. Fetch product details
            $productDetails = $this->topSaleService->getDetailedProductsInParallel($soldProductIds);

            // 4. Process results
            $result = $this->processSoldProducts($productSales, $productDetails);

            // 5. Get totals
            $totals = $this->getSoldProductsTotals();

            // 6. Calculate percentages
            $result = $this->calculatePercentages($result, $totals);

            $finalResult = [
                'success' => true,
                'products' => $result,
                'total_count' => count($result),
                'total_sales' => $totals['total_sales'],
                'total_quantity' => $totals['total_quantity'],
                'has_more' => count($productSales) === $limit,
                'offset' => $offset,
                'limit' => $limit
            ];

            // Cache the result
            $this->cacheResult($cacheKey, $finalResult);

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::info('✅ Top sellers generated', [
                'duration_ms' => $duration,
                'sold_products' => count($result),
                'cache_key' => $cacheKey
            ]);

            return $this->jsonResponse($finalResult, false, $duration);
        } catch (\Exception $e) {
            Log::error('❌ Failed to get top-selling products', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to get top-selling products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Query products that have been sold
     */
    private function getSoldProductsData(int $limit, int $offset): array
    {
        // SIMPLE, CLEAN QUERY
        $query = "SELECT 
            oi.product_id,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.total_price) as total_sales,
            COUNT(DISTINCT oi.order_id) as order_count
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
            AND o.status = 'completed'
        GROUP BY oi.product_id
        ORDER BY total_quantity DESC
        LIMIT ? OFFSET ?";

        $params = [$limit, $offset];

        Log::info('Running TopSell Query', ['sql' => $query, 'params' => $params]);

        try {
            $results = DB::select($query, $params);
            Log::info('Query returned results', ['count' => count($results)]);
            return $results;
        } catch (\Exception $e) {
            Log::error('Database query failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Process sold products with their details
     */
    private function processSoldProducts(array $productSales, array $productDetails): array
    {
        $results = [];
        $rank = 1;

        foreach ($productSales as $sale) {
            $productId = $sale->product_id;
            $productInfo = $productDetails[$productId] ?? null;

            $results[] = [
                'rank' => $rank++,
                'product_id' => $productId,
                'product_name' => $productInfo['name'] ?? 'Unknown Product',
                'sku' => $productInfo['sku'] ?? '',
                'total_quantity_sold' => (int) $sale->total_quantity,
                'total_sales_amount' => (float) $sale->total_sales,
                'order_count' => (int) $sale->order_count,
                'average_quantity_per_order' => $sale->order_count > 0
                    ? round($sale->total_quantity / $sale->order_count, 2)
                    : 0,
                'price' => $productInfo['price'] ?? 0,
                'sale_price' => $productInfo['sale_price'] ?? 0,
                'current_stock' => $productInfo['current_stock'] ?? 0,
                'is_in_stock' => $productInfo['is_in_stock'] ?? false,
                'image_url' => $productInfo['primary_image']['url'] ?? null,
                'category' => $productInfo['category']['name'] ?? null,
                'brand' => $productInfo['brand'] ?? ''
            ];
        }

        return $results;
    }

    /**
     * Get totals for sold products
     */
    private function getSoldProductsTotals(): array
    {
        $cacheKey = 'sold_products_totals';

        return Cache::remember($cacheKey, 300, function () {
            $result = DB::selectOne("
                SELECT 
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.total_price) as total_sales,
                    COUNT(DISTINCT oi.product_id) as unique_products
                FROM order_items oi
                INNER JOIN orders o ON o.id = oi.order_id
                    AND o.status = 'completed'
            ");

            return [
                'total_quantity' => (int) ($result->total_quantity ?? 0),
                'total_sales' => (float) ($result->total_sales ?? 0),
                'unique_products' => (int) ($result->unique_products ?? 0)
            ];
        });
    }

    /**
     * Get product sales trend
     */
    public function getProductSalesTrend(Request $request)
    {
        $productId = $request->get('product_id');
        $days = min($request->get('days', 30), 365);

        if (!$productId) {
            return response()->json([
                'success' => false,
                'error' => 'Product ID is required'
            ], 400);
        }

        $cacheKey = "product_trend_{$productId}_{$days}";

        return Cache::remember($cacheKey, 900, function () use ($productId, $days) {
            $trendData = DB::select("
                SELECT 
                    DATE(o.order_date) as date,
                    SUM(oi.quantity) as quantity,
                    SUM(oi.total_price) as sales,
                    COUNT(DISTINCT o.id) as orders
                FROM order_items oi
                INNER JOIN orders o ON o.id = oi.order_id
                    AND o.status = 'completed'
                WHERE oi.product_id = ?
                    AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY DATE(o.order_date)
                ORDER BY date
            ", [$productId, $days]);

            return [
                'success' => true,
                'product_id' => $productId,
                'period_days' => $days,
                'trend_data' => array_map(function ($item) {
                    return [
                        'date' => $item->date,
                        'quantity' => (int) $item->quantity,
                        'sales' => (float) $item->sales,
                        'orders' => (int) $item->orders
                    ];
                }, $trendData)
            ];
        });
    }

    /**
     * Get best selling products by revenue
     */
    public function getTopByRevenue(Request $request)
    {
        $limit = $this->getValidLimit($request, 10);

        $productSales = DB::select("
            SELECT 
                oi.product_id,
                SUM(oi.total_price) as total_revenue,
                SUM(oi.quantity) as total_quantity,
                COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            INNER JOIN orders o ON o.id = oi.order_id
                AND o.status = 'completed'
            GROUP BY oi.product_id
            HAVING total_revenue > 0
            ORDER BY total_revenue DESC
            LIMIT ?
        ", [$limit]);

        if (empty($productSales)) {
            return response()->json([
                'success' => true,
                'products' => []
            ]);
        }

        $productIds = array_column($productSales, 'product_id');
        $productDetails = $this->topSaleService->getDetailedProductsInParallel($productIds);

        $results = [];
        $rank = 1;
        foreach ($productSales as $sale) {
            $productInfo = $productDetails[$sale->product_id] ?? null;
            $results[] = [
                'rank' => $rank++,
                'product_id' => $sale->product_id,
                'product_name' => $productInfo['name'] ?? 'Unknown Product',
                'total_revenue' => (float) $sale->total_revenue,
                'total_quantity' => (int) $sale->total_quantity,
                'order_count' => (int) $sale->order_count,
                'revenue_per_unit' => $sale->total_quantity > 0
                    ? round($sale->total_revenue / $sale->total_quantity, 2)
                    : 0
            ];
        }

        return response()->json([
            'success' => true,
            'products' => $results
        ]);
    }

    // Helper methods
    private function getValidLimit(Request $request, int $default = 20): int
    {
        $limit = $request->get('limit', $default);
        return min(max((int) $limit, 1), 100);
    }

    private function getValidOffset(Request $request): int
    {
        $offset = $request->get('offset', 0);
        return max((int) $offset, 0);
    }

    private function generateCacheKey(int $limit, int $offset): string
    {
        return "top_selling_{$limit}_{$offset}_" . date('YmdH');
    }

    private function getFromCache(string $key)
    {
        return Cache::get($key);
    }

    private function cacheResult(string $key, array $data): void
    {
        Cache::put($key, $data, 300); // 5 minutes
    }

    private function calculatePercentages(array $products, array $totals): array
    {
        if ($totals['total_quantity'] <= 0) {
            return $products;
        }

        foreach ($products as &$product) {
            $product['quantity_percentage'] = round(
                ($product['total_quantity_sold'] / $totals['total_quantity']) * 100,
                2
            );

            $product['sales_percentage'] = round(
                ($product['total_sales_amount'] / $totals['total_sales']) * 100,
                2
            );
        }

        return $products;
    }

    private function jsonResponse(array $data, bool $cached = false, float $duration = 0): JsonResponse
    {
        $data['cached'] = $cached;
        $data['response_time_ms'] = $duration;
        return response()->json($data);
    }
}
