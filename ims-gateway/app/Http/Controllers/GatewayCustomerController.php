<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayCustomerController extends Controller
{
    protected UserService $userService;
    public function __construct(
        UserService $userService,
    ) {
        $this->userService = $userService;
    }
    public function getCustomerUsers(Request $request): JsonResponse
    {
        try {
            $response = $this->userService->getCustomerUsers($request->query());
            return response()->json($response->json(), $response->status());
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
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteCustomerUser($id): JsonResponse
    {
        try {
            $response = $this->userService->deleteCustomerUser($id);
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
