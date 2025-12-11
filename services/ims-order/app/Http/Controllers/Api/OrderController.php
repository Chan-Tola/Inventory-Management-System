<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\InventoryService;
use App\Services\UserService;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    protected UserService $userService;
    protected InventoryService $inventoryService;
    private CacheService $cacheService;

    public function __construct(
        UserService $userService,
        InventoryService $inventoryService,
        CacheService $cacheService
    ) {
        $this->userService = $userService;
        $this->inventoryService = $inventoryService;
        $this->cacheService = $cacheService;
    }

    public function index(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        try {
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey('orders', $request->all());

            $data = $this->cacheService->remember(
                $cacheKey,
                300, // 5 minutes (orders change frequently)
                function () use ($request, $startTime) {
                    // --- 1. QUERY ORDERS ---
                    $query = Order::with('items');

                    // Apply filters
                    if ($request->has('customer_id')) {
                        $query->where('customer_id', $request->customer_id);
                    }

                    if ($request->has('staff_id')) {
                        $query->where('staff_id', $request->staff_id);
                    }

                    if ($request->has('start_date') && $request->has('end_date')) {
                        $query->whereBetween('order_date', [
                            $request->start_date,
                            $request->end_date
                        ]);
                    }

                    $orders = $query->latest()->paginate(20);
                    Log::info('Orders fetched from DB', ['count' => $orders->count()]);

                    // --- 2. EXTRACT IDs ---
                    $orderCollection = $orders->getCollection();

                    $productIds = $orderCollection
                        ->pluck('items')
                        ->flatten()
                        ->pluck('product_id')
                        ->unique()
                        ->values()
                        ->toArray();

                    $customerIds = $orderCollection
                        ->pluck('customer_id')
                        ->filter()
                        ->unique()
                        ->values()
                        ->toArray();

                    $staffIds = $orderCollection
                        ->pluck('staff_id')
                        ->filter()
                        ->unique()
                        ->values()
                        ->toArray();

                    Log::info('📦 Extracted IDs', [
                        'product_ids' => $productIds,
                        'customer_ids' => $customerIds,
                        'staff_ids' => $staffIds
                    ]);

                    // --- 3. PARALLEL API CALLS ---
                    $promises = [];

                    if (!empty($productIds)) {
                        $promises['products'] = $this->inventoryService->buildProductBatchRequest($productIds);
                    }

                    if (!empty($customerIds)) {
                        $promises['customers'] = $this->userService->buildCustomerBatchRequest($customerIds);
                    }

                    if (!empty($staffIds)) {
                        $promises['staff'] = $this->userService->buildStaffBatchRequest($staffIds);
                    }

                    Log::info('🚀 Making parallel requests', ['request_count' => count($promises)]);

                    // Wait for all promises
                    $responses = [];
                    foreach ($promises as $key => $promise) {
                        try {
                            $responses[$key] = $promise->wait();
                        } catch (\Exception $e) {
                            Log::error("❌ {$key} request failed", ['error' => $e->getMessage()]);
                            $responses[$key] = null;
                        }
                    }

                    // --- 4. PROCESS RESPONSES ---
                    $productNames = $this->inventoryService->processProductResponse($responses['products'] ?? null);
                    $customerNames = $this->userService->processCustomerResponse($responses['customers'] ?? null);
                    $staffNames = $this->userService->processStaffResponse($responses['staff'] ?? null);

                    // --- 5. TRANSFORM ORDERS ---
                    $orders->getCollection()->transform(function ($order) use ($productNames, $customerNames, $staffNames) {
                        $order->customer_name = $customerNames[$order->customer_id] ?? 'Unknown Customer';
                        $order->staff_name = $staffNames[$order->staff_id] ?? 'Unknown Staff';

                        $order->items->transform(function ($item) use ($productNames) {
                            $item->product_name = $productNames[$item->product_id] ?? 'Unknown Product';
                            return $item;
                        });

                        return $order;
                    });

                    $duration = round((microtime(true) - $startTime) * 1000, 2);
                    Log::info("✅ Request completed in {$duration}ms");

                    return $orders;
                },
                'orders'  // Cache tag
            );

            return response()->json([
                'success' => true,
                'message' => 'Orders retrieved successfully',
                'data' => OrderResource::collection($data)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve orders', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders'
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey("order:{$id}");

            $order = $this->cacheService->remember(
                $cacheKey,
                300, // 5 minutes
                function () use ($id) {
                    return Order::with('items')->find($id);
                },
                "order:{$id}"
            );

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order retrieved successfully',
                'data' => new OrderResource($order)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order'
            ], 500);
        }
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            // Calculate total amount
            $totalAmount = collect($request->items)->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            // Create order with validated data
            $order = Order::create([
                'customer_id' => $request->customer_id,
                'staff_id' => $request->staff_id,
                'total_amount' => $totalAmount,
                'status' => 'completed', // Assuming new orders are completed
            ]);

            // Create order items
            foreach ($request->items as $itemData) {
                $order->items()->create([
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                ]);
            }

            // ✅ Load the items relationship
            $order->load('items');

            DB::commit();

            // Create inventory transactions for each item
            $transactionResults = [];
            foreach ($order->items as $item) {
                $result = $order->createInventoryTransaction($item);
                $transactionResults[] = $result;
            }

            // 🚨 COMPLETE CACHE CLEARING - INCLUDING TOP-SELLING
            $this->clearAllRelatedCaches($order);

            Log::info('✅ Order created and caches cleared', [
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'items_count' => $order->items->count()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => new OrderResource($order)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create order', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,completed,cancelled'
            ]);

            $order = Order::with('items')->find($id);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldStatus = $order->status;
            $order->update(['status' => $request->status]);

            // 🚨 CLEAR CACHES - Only clear top-selling if status changed to/from 'completed'
            if ($oldStatus === 'completed' || $request->status === 'completed') {
                $this->clearAllRelatedCaches($order);
            } else {
                // Only clear order caches if status didn't affect completed orders
                $this->clearOrderOnlyCaches($order, $id);
            }

            Log::info('✅ Order status updated', [
                'order_id' => $id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'cache_cleared' => ($oldStatus === 'completed' || $request->status === 'completed') ? 'all' : 'orders_only'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => new OrderResource($order->load(['items.product', 'customer', 'staff']))
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update order status', ['order_id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status'
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $order = Order::with('items')->find($id);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Store status before deletion
            $wasCompleted = $order->status === 'completed';
            $customerId = $order->customer_id;
            $staffId = $order->staff_id;
            $productIds = $order->items->pluck('product_id')->toArray();

            $order->delete();

            DB::commit();

            // 🚨 CLEAR CACHES - Clear top-selling if deleted order was completed
            if ($wasCompleted) {
                $this->clearAllRelatedCachesForDeletedOrder($id, $customerId, $staffId, $productIds);
            } else {
                // Only clear order caches
                $this->clearOrderOnlyCachesForDeletedOrder($id, $customerId, $staffId);
            }

            Log::info('✅ Order deleted', [
                'order_id' => $id,
                'was_completed' => $wasCompleted,
                'cache_cleared' => $wasCompleted ? 'all' : 'orders_only'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete order', ['order_id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order'
            ], 500);
        }
    }

    /**
     * Clear ALL related caches when order affects top-selling data
     */
    private function clearAllRelatedCaches(Order $order): void
    {
        try {
            // 1. Clear order-related caches
            $this->cacheService->clearByTag('orders');
            $this->cacheService->clearByTag("order:{$order->id}");
            $this->cacheService->clearByTag("customer:{$order->customer_id}:orders");
            $this->cacheService->clearByTag("staff:{$order->staff_id}:orders");

            // 2. Clear product-related caches (inventory affected)
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag('stocks');
            $this->cacheService->clearByTag('transactions');

            // Clear each product cache individually
            foreach ($order->items as $item) {
                $this->cacheService->clearByTag("product:{$item->product_id}");
                $this->cacheService->clearByTag("product:{$item->product_id}:stock");
                $this->cacheService->clearByTag("product:{$item->product_id}:transactions");
            }

            // 3. 🚨 CRITICAL: Clear top-selling caches
            $this->cacheService->clearByTag('top-selling');
            $this->cacheService->clearByTag('top-selling-totals');
            $this->cacheService->clearByTag('product-trends');
            $this->cacheService->clearByTag('top-revenue');

            // 4. Clear reports
            $this->cacheService->clearByTag('reports');

            Log::info('All related caches cleared', [
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'product_ids' => $order->items->pluck('product_id')->toArray()
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to clear all caches', [
                'error' => $e->getMessage(),
                'order_id' => $order->id
            ]);
        }
    }

    /**
     * Clear only order caches (when status change doesn't affect completed orders)
     */
    private function clearOrderOnlyCaches(Order $order, $orderId): void
    {
        try {
            $this->cacheService->clearByTag('orders');
            $this->cacheService->clearByTag("order:{$orderId}");
            $this->cacheService->clearByTag("customer:{$order->customer_id}:orders");
            $this->cacheService->clearByTag("staff:{$order->staff_id}:orders");
        } catch (\Exception $e) {
            Log::warning('Failed to clear order caches', [
                'error' => $e->getMessage(),
                'order_id' => $orderId
            ]);
        }
    }

    /**
     * Clear all caches for deleted order (was completed)
     */
    private function clearAllRelatedCachesForDeletedOrder($orderId, $customerId, $staffId, $productIds): void
    {
        try {
            // 1. Clear order-related caches
            $this->cacheService->clearByTag('orders');
            $this->cacheService->clearByTag("order:{$orderId}");
            $this->cacheService->clearByTag("customer:{$customerId}:orders");
            $this->cacheService->clearByTag("staff:{$staffId}:orders");

            // 2. Clear product-related caches
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag('stocks');
            $this->cacheService->clearByTag('transactions');

            // Clear each product cache individually
            foreach ($productIds as $productId) {
                $this->cacheService->clearByTag("product:{$productId}");
                $this->cacheService->clearByTag("product:{$productId}:stock");
                $this->cacheService->clearByTag("product:{$productId}:transactions");
            }

            // 3. 🚨 Clear top-selling caches
            $this->cacheService->clearByTag('top-selling');
            $this->cacheService->clearByTag('top-selling-totals');
            $this->cacheService->clearByTag('product-trends');
            $this->cacheService->clearByTag('top-revenue');

            // 4. Clear reports
            $this->cacheService->clearByTag('reports');
        } catch (\Exception $e) {
            Log::warning('Failed to clear caches for deleted order', [
                'error' => $e->getMessage(),
                'order_id' => $orderId
            ]);
        }
    }

    /**
     * Clear only order caches for deleted order (was not completed)
     */
    private function clearOrderOnlyCachesForDeletedOrder($orderId, $customerId, $staffId): void
    {
        try {
            $this->cacheService->clearByTag('orders');
            $this->cacheService->clearByTag("order:{$orderId}");
            $this->cacheService->clearByTag("customer:{$customerId}:orders");
            $this->cacheService->clearByTag("staff:{$staffId}:orders");
        } catch (\Exception $e) {
            Log::warning('Failed to clear order caches for deleted order', [
                'error' => $e->getMessage(),
                'order_id' => $orderId
            ]);
        }
    }
}
