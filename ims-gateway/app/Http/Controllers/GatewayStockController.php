<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayStockController extends Controller
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

    public function getStocks(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('stocks', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 300, function () use ($request) {
                $response = $this->inventoryService->getStocks($request->query());
                return $response->json();
            }, 'stocks');

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

    public function getStock($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getStock($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function createStock(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->createStock($request->all());

            $this->cacheService->clearByTag('stocks');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateStock(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateStock($id, $request->all());

            $this->cacheService->clearByTag('stocks');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteStock($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteStock($id);

            $this->cacheService->clearByTag('stocks');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: HandleServiceError
    private function handleServiceError(RequestException $e): JsonResponse
    {
        $statusCode = $e->response ? $e->response->status() : 503;
        $message = $e->response ? $e->response->json() : ['error' => 'Service unavailable'];
        return response()->json($message, $statusCode);
    }
}
