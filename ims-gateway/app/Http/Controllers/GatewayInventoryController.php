<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayInventoryController extends Controller
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
    
    public function getCategories(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('categories', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                return $this->inventoryService->getCategories($request->query())->json();
            });

            return response()->json($data);
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
            $data = $request->all();
            $data['staff_id'] = $request->staff_id;

            $response = $this->inventoryService->createCategory($data);

            // Clear category cache
            $this->cacheService->clearByPrefix('categories');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    //note: update
    public function updateCategory(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->all();
            $data['staff_id'] = $request->staff_id;
            $response = $this->inventoryService->updateCategory($id, $data);

            $this->cacheService->clearByPrefix('categories');

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

            $this->cacheService->clearByPrefix('categories');

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
