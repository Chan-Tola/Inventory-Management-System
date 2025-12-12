<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayCustomerController extends Controller
{
    protected UserService $userService;
    protected CacheService $cacheService;
    public function __construct(
        UserService $userService,
        CacheService $cacheService,
    ) {
        $this->userService = $userService;
        $this->cacheService = $cacheService;
    }
    public function getCustomerUsers(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            // $response = $this->userService->getCustomerUsers($request->query());
            $cacheKey = $this->cacheService->generateKey('customers', $queryParams);
            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                $response = $this->userService->getCustomerUsers($request->query());
                return $response->json();
            }, 'customers');
            // return response()->json($response->json(), $response->status());
            return response()->json($data);
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function getCustomerUser($id): JsonResponse
    {
        try {
            $response = $this->userService->getCustomerUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function createCustomerUser(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            $response = $this->userService->createCustomerUser($data);
            $this->cacheService->clearByTag('customers');
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateCustomerUser(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->all();
            $response = $this->userService->updateCustomerUser($id, $data);
            $this->cacheService->clearByTag('customers');
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteCustomerUser($id): JsonResponse
    {
        try {
            $response = $this->userService->deleteCustomerUser($id);
            $this->cacheService->clearByTag('customers');
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
