<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayOrderController extends Controller
{
    protected OrderService $orderService;
    protected CacheService $cacheService;

    public function __construct(
        OrderService $orderService,
        CacheService $cacheService,
    ) {
        $this->orderService = $orderService;
        $this->cacheService = $cacheService;
    }

    public function getOrders(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->all();
            $cacheKey = $this->cacheService->generateKey('orders', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 900, function () use ($request) {
                $response = $this->orderService->getOrders($request->all());
                return $response->json();
            }, 'orders');

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getOrder($id): JsonResponse
    {
        try {
            $response = $this->orderService->getOrder($id);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order: ' . $e->getMessage()
            ], 500);
        }
    }
    public function createOrder(Request $request): JsonResponse
    {
        try {
            $requestData = $request->all();
            $data['staff_id'] = $request->staff_id;

            $orderData = [
                'customer_id' => $requestData['customer_id'],
                'staff_id' => $requestData['staff_id'],
                'items' => $requestData['items']
            ];

            $response = $this->orderService->createOrder($orderData);

            $this->cacheService->clearByTag('orders');
            $this->cacheService->clearByTag('transactions');
            $this->cacheService->clearByTag('stocks');

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }
    public function updateOrderStatus(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,completed,cancelled'
            ]);

            $response = $this->orderService->updateOrderStatus($id, $request->status);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteOrder($id): JsonResponse
    {
        try {
            $response = $this->orderService->deleteOrder($id);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage()
            ], 500);
        }
    }
}
