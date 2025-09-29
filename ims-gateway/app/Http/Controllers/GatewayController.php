<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use App\Services\OrderService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;

class GatewayController extends Controller
{
    protected InventoryService $inventoryService;
    protected OrderService $orderService;
    protected UserService $userService;

    public function __construct(
        InventoryService $inventoryService,
        OrderService $orderService,
        UserService $userService
    ) {
        $this->inventoryService = $inventoryService;
        $this->orderService = $orderService;
        $this->userService = $userService;
    }

    // note: Inventory Routes
    public function getProducts(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->getProducts($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: Orders Routes
    public function getOrders(Request $request): JsonResponse
    {
        try {
            $response = $this->orderService->getOrders($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: Users Routes
    public function getUsers(Request $request): JsonResponse
    {
        try {
            $response = $this->userService->getUsers($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }



    private function handleServiceError(RequestException $e): JsonResponse
    {
        $statusCode = $e->response ? $e->response->status() : 503;
        $message = $e->response ? $e->response->json() : ['error' => 'Service unavailable'];

        return response()->json($message, $statusCode);
    }
}
