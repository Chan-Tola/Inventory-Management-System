<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayTransactionController extends Controller
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
    public function getTransactions(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->all();
            $cacheKey = $this->cacheService->generateKey('transactions', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 900, function () use ($request) {
                $response = $this->inventoryService->getTransactions($request->all());
                return $response->json();
            },'transactions');

            return response()->json($data);
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function getTransaction($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getTransaction($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function createTransaction(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            $data['staff_id'] = $request->staff_id;

            $response = $this->inventoryService->createTransaction($data);

            $this->cacheService->clearByTag('transactions');

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
