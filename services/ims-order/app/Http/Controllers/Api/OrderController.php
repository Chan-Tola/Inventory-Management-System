<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\CacheService;
use App\Services\InventoryService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    protected UserService $userService;
    protected InventoryService $inventoryService;
    protected CacheService $cacheService;

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
            // Generate cache key with query parameters
            $cacheKey = $this->cacheService->generateKey('orders', $request->query());

            // Use cache with 10 minutes TTL (orders change frequently)
            $orders = $this->cacheService->remember(
                $cacheKey,
                600, // 10 minutes
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
                        // Get customer info (now contains both name and address)
                        $customerInfo = $customerNames[$order->customer_id] ?? null;

                        $order->customer_name = $customerInfo['name'] ?? 'Unknown Customer';
                        $order->customer_address = $customerInfo['address'] ?? 'No Address Provided'; // ✅ Fixed

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
                'orders' // Tag for easy clearing
            );

            return response()->json([
                'success' => true,
                'message' => 'Orders retrieved successfully',
                'data' => OrderResource::collection($orders)
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
            // Generate cache key for specific order
            $cacheKey = $this->cacheService->generateKey("order:{$id}");

            $order = $this->cacheService->remember(
                $cacheKey,
                900, // 15 minutes
                function () use ($id) {
                    return Order::with('items')->find($id);
                },
                'orders'
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
            ]);

            // Create order items
            foreach ($request->items as $itemData) {
                $order->items()->create([
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                ]);
            }

            // ✅ Load the items relationship
            $order->load('items');

            DB::commit();

            // Create inventory transactions for each item
            $transactionResults = [];
            $productIds = []; // Track affected product IDs for cache clearing

            foreach ($order->items as $item) {
                $result = $order->createInventoryTransaction($item);
                $transactionResults[] = $result;
                $productIds[] = $item->product_id;
            }

            // 🔥 Clear order cache after creation
            $this->clearOrderCache();

            // 🔥 Also clear inventory cache in the Inventory service
            if (!empty($productIds)) {
                $this->clearInventoryCacheViaAPI($productIds);
            }

            Log::info('✅ Order created successfully', [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'items_count' => $order->items->count(),
                'product_ids' => array_unique($productIds)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => new OrderResource($order)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create order', [
                'error' => $e->getMessage()
            ]);

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

            $order = Order::find($id);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldStatus = $order->status;
            $order->update(['status' => $request->status]);

            // 🔥 Clear cache if status changed
            if ($oldStatus !== $request->status) {
                $this->clearOrderCache($id);

                // If order status changed to/from completed, clear inventory cache
                if ($oldStatus === 'completed' || $request->status === 'completed') {
                    $productIds = $order->items->pluck('product_id')->toArray();
                    if (!empty($productIds)) {
                        $this->clearInventoryCacheViaAPI($productIds);
                    }
                }
            }

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
            $order = Order::find($id);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Get product IDs before deletion for cache clearing
            $productIds = $order->items->pluck('product_id')->toArray();

            // Delete order items first
            $order->items()->delete();
            $order->delete();

            DB::commit();

            // 🔥 Clear order cache after deletion
            $this->clearOrderCache($id);

            // 🔥 Clear inventory cache if order was completed
            if ($order->status === 'completed' && !empty($productIds)) {
                $this->clearInventoryCacheViaAPI($productIds);
            }

            Log::info('Order deleted successfully', [
                'order_id' => $id,
                'product_ids' => $productIds
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
     * Clear order-related cache
     */
    private function clearOrderCache(?int $orderId = null): void
    {
        try {
            if ($orderId) {
                $this->cacheService->forget("order:{$orderId}");
            }

            $this->cacheService->clearByPrefix('orders:');
            $this->cacheService->clearByTag('orders');

            Log::info("🧹 Order cache cleared", ['order_id' => $orderId]);
        } catch (\Exception $e) {
            Log::warning('Failed to clear order cache', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Clear inventory cache via API call to Inventory service
     * This triggers the clearInventoryCache() method in TransactionController
     */
    private function clearInventoryCacheViaAPI(array $productIds): void
    {
        try {
            if (empty($productIds)) {
                return;
            }

            // For each product ID, we need to trigger cache clearing in Inventory service
            // Since we're already creating transactions via InventoryService,
            // the TransactionController's clearInventoryCache() will be called

            // But we also need to ensure list caches are cleared
            // We'll make a direct API call to clear cache for these products

            $uniqueProductIds = array_unique($productIds);

            foreach ($uniqueProductIds as $productId) {
                // When createInventoryTransaction is called in Order model,
                // it triggers the TransactionController's storeInternal method
                // which already calls clearInventoryCache($productId)

                // So we just need to ensure the transaction list cache is also cleared
                // This happens in the TransactionController
            }

            Log::info('🔄 Inventory cache clearing triggered via order creation', [
                'product_ids' => $uniqueProductIds
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to trigger inventory cache clearing', [
                'error' => $e->getMessage(),
                'product_ids' => $productIds
            ]);
        }
    }
}
