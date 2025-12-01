<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayProductController extends Controller
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

    public function getProducts(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('products', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                $response = $this->inventoryService->getProducts($request->query());
                return $response->json();
            }, 'products');

            return response()->json($data);
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
            $data = $request->all();
            $data['staff_id'] = $request->staff_id;

            if (isset($data['images']) && is_array($data['images']) && $this->inventoryService->isBase64Data($data['images'])) {
                $data['_image_type'] = 'base64';
                $response = $this->inventoryService->createProductWithBase64($data);
            } elseif ($request->hasFile('images')) {
                $images = $request->file('images');
                $data['images'] = is_array($images) ? $images : [$images];
                $response = $this->inventoryService->createProduct($data);
            } else {
                $response = $this->inventoryService->createProduct($data);
            }

            $this->cacheService->clearByTag('products');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateProduct(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->all();
            $data['staff_id'] = $request->staff_id;

            if (isset($data['images']) && is_array($data['images']) && $this->inventoryService->isBase64Data($data['images'])) {
                $data['_image_type'] = 'base64';
                $response = $this->inventoryService->updateProductWithBase64($id, $data);
            } elseif ($request->hasFile('images')) {
                $images = $request->file('images');
                $data['images'] = is_array($images) ? $images : [$images];
                $response = $this->inventoryService->updateProduct($id, $data);
            } else {
                $response = $this->inventoryService->updateProduct($id, $data);
            }

            $this->cacheService->clearByTag('products');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteProduct($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteProduct($id);

            $this->cacheService->clearByTag('products');

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
