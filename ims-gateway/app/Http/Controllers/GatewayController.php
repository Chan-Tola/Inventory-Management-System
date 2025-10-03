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
    // note: Categories CRUD
    // note: index
    public function getCategories(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->getCategories($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: show
    public function getCategory($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getCategory($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: store 
    public function createCategory(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->createCategory($request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    //note: update
    public function updateCategory(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateCategory($id, $request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: delete
    public function deleteCategory($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteCategory($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }


    // note: Products CRUD
    public function getProducts(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->getProducts($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function getProduct($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getProduct($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    public function createProduct(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->createProduct($request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    public function updateProduct(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateProduct($id, $request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    public function deleteProduct($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteProduct($id);
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
