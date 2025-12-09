<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
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

    public function __construct(
        UserService $userService,
        InventoryService $inventoryService
    ) {
        $this->userService = $userService;
        $this->inventoryService = $inventoryService;
    }


    public function index(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        try {
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
            $order = Order::with('items')->find($id); // ✅ Only load items

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

            $transactionResults = [];
            foreach ($order->items as $item) {
                $result = $order->createInventoryTransaction($item);
                $transactionResults[] = $result;
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => new OrderResource($order)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ UPDATE order status
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

            $order->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => new OrderResource($order->load(['items.product', 'customer', 'staff']))
            ]);
        } catch (\Exception $e) {
            // Log::error('Failed to update order status', ['order_id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status'
            ], 500);
        }
    }

    // ✅ DELETE order
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

            $order->delete();

            DB::commit();

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
}
