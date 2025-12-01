<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewaySupplierController extends Controller
{
    protected InventoryService $inventoryService;
    protected CacheService $cacheService;

    public function __construct(
        InventoryService $inventoryService,
        CacheService $cacheService,
    ) {
        $this->inventoryService = $inventoryService;
        $this->cacheService = $cacheService;
    }
    public function getSuppliers(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('suppliers', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                $response = $this->inventoryService->getSuppliers($request->query());
                return $response->json();
            }, 'suppliers');

            return response()->json($data);
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSupplier($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getSupplier($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function createSupplier(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->createSupplier($request->all());

            $this->cacheService->clearByTag('suppliers');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateSupplier(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateSupplier($id, $request->all());

            $this->cacheService->clearByTag('suppliers');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteSupplier($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteSupplier($id);

            $this->cacheService->clearByTag('suppliers');

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
