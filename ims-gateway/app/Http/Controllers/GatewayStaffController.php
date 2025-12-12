<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class GatewayStaffController extends Controller
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
    public function getStaffUsers(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('staffs', $queryParams);
            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                $response = $this->userService->getStaffUsers($request->query());
                return $response->json();
            }, 'staffs');

            // $response = $this->userService->getStaffUsers($request->query());
            // $data = $response->json();

            return response()->json($data);
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function getStaffUser($id): JsonResponse
    {
        try {
            $response = $this->userService->getStaffUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function createStaffUser(Request $request): JsonResponse
    {
        try {
            $data = $request->all();

            if (isset($data['profile_url']) && $this->userService->isSingleBase64Image($data['profile_url'])) {
                $data['_image_type'] = 'base64';
                $response = $this->userService->createStaffUserWithBase64($data);
            } elseif ($request->hasFile('profile_url')) {
                $images = $request->file('profile_url');
                $data['profile_url'] = is_array($images) ? $images : [$images];
                $response = $this->userService->createStaffUser($data);
            } else {
                $response = $this->userService->createStaffUser($data);
            }

            $this->cacheService->clearByTag('staffs');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateStaffUser(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->all();

            if (isset($data['profile_url']) && $this->userService->isSingleBase64Image($data['profile_url'])) {
                $data['_image_type'] = 'base64';
                $response = $this->userService->updateStaffUserWithBase64($id, $data);
            } elseif ($request->hasFile('profile_url')) {
                $images = $request->file('profile_url');
                $data['profile_url'] = is_array($images) ? $images : [$images];
                $response = $this->userService->updateStaffUser($id, $data);
            } else {
                $response = $this->userService->updateStaffUser($id, $data);
            }

            $this->cacheService->clearByTag('staffs');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteStaffUser($id): JsonResponse
    {
        try {
            $response = $this->userService->deleteStaffUser($id);

            $this->cacheService->clearByTag('staffs');
            
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
