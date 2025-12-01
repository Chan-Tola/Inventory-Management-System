<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }


    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with('items'); // ✅ Only load items

            // Filter by customer_id
            if ($request->has('customer_id')) {
                $query->where('customer_id', $request->customer_id);
            }

            // Filter by staff_id
            if ($request->has('staff_id')) {
                $query->where('staff_id', $request->staff_id);
            }

            // Filter by date range
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('order_date', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            $orders = $query->latest()->paginate(20);

            return response()->json([
                'success' => true,
                'message' => 'Orders retrieved successfully',
                'data' => OrderResource::collection($orders)
            ]);
        } catch (\Exception $e) {
            // Log::error('Failed to retrieve orders', ['error' => $e->getMessage()]);
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
