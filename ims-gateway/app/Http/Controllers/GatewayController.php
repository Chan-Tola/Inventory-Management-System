<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Services\InventoryService;
use App\Services\OrderService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;

class GatewayController extends Controller
{
    protected AuthService $authService;
    protected InventoryService $inventoryService;
    protected OrderService $orderService;
    protected UserService $userService;



    public function __construct(
        AuthService $authService,
        InventoryService $inventoryService,
        OrderService $orderService,
        UserService $userService,
    ) {
        $this->authService = $authService;
        $this->inventoryService = $inventoryService;
        $this->orderService = $orderService;
        $this->userService = $userService;
    }

    // note: login function
    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);
            $response = $this->authService->login($credentials);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: register function
    // note: logout function
    public function logout(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();
            $response = $this->authService->logout($token);

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
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
            // ✅ FIRST: Get ALL form data including text fields
            $data = $request->all();

            // ✅ THEN: Get user_id from token
            $token = $request->bearerToken();
            if ($token) {
                $payload = json_decode(base64_decode(explode('.', $token)[1]), true);
                $userId = $payload['sub'] ?? null;

                if ($userId) {
                    $staffResponse = $this->userService->getStaffByUser($userId);

                    if ($staffResponse->successful()) {
                        $staffData = $staffResponse->json();
                        $data['staff_id'] = $staffData['data']['staff_id'] ?? null;

                        Log::info('Successfully converted user_id to staff_id', [
                            'user_id' => $userId,
                            'staff_id' => $data['staff_id']
                        ]);
                    } else {
                        // Fallback for testing
                        Log::error('Failed to get staff_id from user service', [
                            'user_id' => $userId,
                            'status' => $staffResponse->status(),
                            'error' => $staffResponse->body()
                        ]);
                    }

                    unset($data['user_id']);
                }
            }

            // ✅ DEBUG: Check what data we're sending
            Log::info('Complete data before sending to inventory', [
                'all_keys' => array_keys($data),
                'user_id' => $data['user_id'] ?? 'missing'
            ]);
            $response = $this->inventoryService->createCategory($data);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    //note: update
    public function updateCategory(Request $request, $id): JsonResponse
    {
        try {

            // ✅ FIRST: Get ALL form data including text fields
            $data = $request->all();

            // ✅ THEN: Get user_id from token
            $token = $request->bearerToken();

            if ($token) {
                $payload = json_decode(base64_decode(explode('.', $token)[1]), true);
                $userId = $payload['sub'] ?? null;

                if ($userId) {
                    $staffResponse = $this->userService->getStaffByUser($userId);

                    if ($staffResponse->successful()) {
                        $staffData = $staffResponse->json();
                        $data['staff_id'] = $staffData['data']['staff_id'] ?? null;

                        // Log::info('Successfully converted user_id to staff_id', [
                        //     'user_id' => $userId,
                        //     'staff_id' => $data['staff_id']
                        // ]);
                    }
                    unset($data['user_id']);
                }
            }

            $response = $this->inventoryService->updateCategory($id, $data);
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
            // ✅ FIRST: Get ALL form data including text fields
            $data = $request->all();

            // ✅ THEN: Get user_id from token
            $token = $request->bearerToken();
            if ($token) {
                $payload = json_decode(base64_decode(explode('.', $token)[1]), true);
                $userId = $payload['sub'] ?? null;

                if ($userId) {
                    Log::info('Attempting to get staff_id for user', ['user_id' => $userId]);

                    $staffResponse = $this->userService->getStaffByUser($userId);

                    if ($staffResponse->successful()) {
                        $staffData = $staffResponse->json();
                        $data['staff_id'] = $staffData['data']['staff_id'] ?? null;

                        Log::info('Successfully converted user_id to staff_id', [
                            'user_id' => $userId,
                            'staff_id' => $data['staff_id']
                        ]);
                    } else {
                        // Fallback for testing
                        Log::error('Failed to get staff_id from user service', [
                            'user_id' => $userId,
                            'status' => $staffResponse->status(),
                            'error' => $staffResponse->body()
                        ]);
                    }

                    unset($data['user_id']);
                }
            }

            // ✅ CORRECTED: Handle Flutter (base64) FIRST
            if (isset($data['images']) && is_array($data['images']) && $this->inventoryService->isBase64Data($data['images'])) {
                $data['_image_type'] = 'base64';
                Log::info('Base64 images detected (Flutter)', ['image_count' => count($data['images'])]);
                // Use the new base64 method
                $response = $this->inventoryService->createProductWithBase64($data);
            }
            // ✅ Then handle React.js (files)
            elseif ($request->hasFile('images')) {
                $images = $request->file('images');
                $data['images'] = is_array($images) ? $images : [$images];
                Log::info('File upload detected (React.js)', ['file_count' => count($data['images'])]);
                // Use regular method for file uploads
                $response = $this->inventoryService->createProduct($data);
            }
            // ✅ No images case
            else {
                Log::info('No images detected, creating product with basic data');
                $response = $this->inventoryService->createProduct($data);
            }


            // ✅ DEBUG: Check what data we're sending
            Log::info('Complete data before sending to inventory', [
                'all_keys' => array_keys($data),
                'text_fields' => [
                    'name' => $data['name'] ?? 'missing',
                    'sku' => $data['sku'] ?? 'missing',
                    'category_id' => $data['category_id'] ?? 'missing',
                    'brand' => $data['brand'] ?? 'missing',
                    'price' => $data['price'] ?? 'missing',
                    'description' => $data['description'] ?? 'missing',
                ],
                'has_images' => isset($data['images']),
                'user_id' => $data['user_id'] ?? 'missing'
            ]);

            // $response = $this->inventoryService->createProduct($data);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateProduct(Request $request, $id): JsonResponse
    {
        try {
            // ✅ FIRST: Get ALL form data including text fields
            $data = $request->all();

            // ✅ THEN: Get user_id from token
            $token = $request->bearerToken();
            if ($token) {
                $payload = json_decode(base64_decode(explode('.', $token)[1]), true);
                $userId = $payload['sub'] ?? null;

                if ($userId) {
                    Log::info('Attempting to get staff_id for user', ['user_id' => $userId]);

                    $staffResponse = $this->userService->getStaffByUser($userId);

                    if ($staffResponse->successful()) {
                        $staffData = $staffResponse->json();
                        $data['staff_id'] = $staffData['data']['staff_id'] ?? null;

                        Log::info('Successfully converted user_id to staff_id', [
                            'user_id' => $userId,
                            'staff_id' => $data['staff_id']
                        ]);
                    } else {
                        // Fallback for testing
                        Log::error('Failed to get staff_id from user service', [
                            'user_id' => $userId,
                            'status' => $staffResponse->status(),
                            'error' => $staffResponse->body()
                        ]);
                    }

                    unset($data['user_id']);
                }
            }

            // ✅ CORRECTED: Handle Flutter (base64) FIRST
            if (isset($data['images']) && is_array($data['images']) && $this->inventoryService->isBase64Data($data['images'])) {
                $data['_image_type'] = 'base64';
                Log::info('Base64 images detected (Flutter)', ['image_count' => count($data['images'])]);
                // Use the new base64 method
                $response = $this->inventoryService->updateProductWithBase64($id, $data);
            }
            // ✅ Then handle React.js (files)
            elseif ($request->hasFile('images')) {
                $images = $request->file('images');
                $data['images'] = is_array($images) ? $images : [$images];
                Log::info('File upload detected (React.js)', ['file_count' => count($data['images'])]);
                // Use regular method for file uploads
                $response = $this->inventoryService->updateProduct($id, $data);
            }
            // ✅ No images case
            else {
                Log::info('No images detected, creating product with basic data');
                $response = $this->inventoryService->updateProduct($id, $data);
            }

            // $response = $this->inventoryService->updateProduct($id, $request->all());
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

    // note: Stock CRUD
    // note: index
    public function getStocks(Request $request): JsonResponse
    {

        try {
            $response = $this->inventoryService->getStocks($request->query());

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // note: show
    public function getStock($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getStock($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: store 
    public function createStock(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->createStock($request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    //note: update
    public function updateStock(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateStock($id, $request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: delete
    public function deleteStock($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteStock($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: supplier CRUD
    // note: index
    public function getSuppliers(Request $request): JsonResponse
    {

        try {
            $response = $this->inventoryService->getSuppliers($request->query());

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // note: show
    public function getSupplier($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getSupplier($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: store 
    public function createSupplier(Request $request): JsonResponse
    {
        try {
            $response = $this->inventoryService->createSupplier($request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    //note: update
    public function updateSupplier(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateSupplier($id, $request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: delete
    public function deleteSupplier($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteSupplier($id);
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
    // note: IMS-User
    // note: Users Routes + staff
    // note: index
    public function getStaffUsers(Request $request): JsonResponse
    {
        try {
            $response = $this->userService->getStaffUsers($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: show
    public function getStaffUser($id): JsonResponse
    {
        try {
            $response = $this->userService->getStaffUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: store
    public function createStaffUser(Request $request): JsonResponse
    {
        try {
            // ✅ FIRST: Get ALL form data including text fields
            $data = $request->all();
            // ✅ CORRECTED: Handle Flutter (base64) FIRST
            if (isset($data['profile_url']) && $this->userService->isSingleBase64Image($data['profile_url'])) {
                $data['_image_type'] = 'base64';
                // Use the new base64 method
                $response = $this->userService->createStaffUserWithBase64($data);
            }
            // ✅ Then handle React.js (files)
            elseif ($request->hasFile('profile_url')) {
                $images = $request->file('profile_url');
                $data['profile_url'] = is_array($images) ? $images : [$images];
                // Use regular method for file uploads
                $response = $this->userService->createStaffUser($data);
            }
            // ✅ No images case
            else {
                Log::info('No images detected, creating product with basic data');
                $response = $this->userService->createStaffUser($data);
            }
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: update
    // public function updateStaffUser($id): JsonResponse
    // {
    //     try {
    //         $response = $this->userService->updateStaffUser($id);
    //         return response()->json($response->json(), $response->status());
    //     } catch (RequestException $e) {
    //         return $this->handleServiceError($e);
    //     }
    // }
    // // note: delete
    // public function deleteStaffUser($id): JsonResponse
    // {
    //     try {
    //         $response = $this->userService->deleteUser($id);
    //         return response()->json($response->json(), $response->status());
    //     } catch (RequestException $e) {
    //         return $this->handleServiceError($e);
    //     }
    // }
    // note: Users Routes +  Customers 
    // note: index
    // public function getStaffCustomers(Request $request): JsonResponse
    // {
    //     try {
    //         $response = $this->userService->getUsers($request->query());
    //         return response()->json($response->json(), $response->status());
    //     } catch (RequestException $e) {
    //         return $this->handleServiceError($e);
    //     }
    // }
    // // note: show
    // public function getCustomerUser($id): JsonResponse
    // {
    //     try {
    //         $response = $this->userService->getUsers($id);
    //         return response()->json($response->json(), $response->status());
    //     } catch (RequestException $e) {
    //         return $this->handleServiceError($e);
    //     }
    // }


    // note: HanldeServiceError
    private function handleServiceError(RequestException $e): JsonResponse
    {
        $statusCode = $e->response ? $e->response->status() : 503;
        $message = $e->response ? $e->response->json() : ['error' => 'Service unavailable'];
        return response()->json($message, $statusCode);
    }
}
