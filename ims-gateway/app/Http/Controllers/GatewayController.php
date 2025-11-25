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

    public function getTransactions(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->all();
            $response = $this->inventoryService->getTransactions($queryParams);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: get single transaction
    public function getTransaction($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->getTransaction($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: create transaction (with staff_id from token)
    public function createTransaction(Request $request): JsonResponse
    {
        try {
            // ✅ FIRST: Get ALL form data including text fields
            $data = $request->all();

            // ✅ THEN: Get staff_id from token (same as your category method)
            $token = $request->bearerToken();
            if ($token) {
                $payload = json_decode(base64_decode(explode('.', $token)[1]), true);
                $userId = $payload['sub'] ?? null;

                if ($userId) {
                    $staffResponse = $this->userService->getStaffByUser($userId);

                    if ($staffResponse->successful()) {
                        $staffData = $staffResponse->json();
                        $data['staff_id'] = $staffData['data']['staff_id'] ?? null;

                        Log::info('Successfully converted user_id to staff_id for transaction', [
                            'user_id' => $userId,
                            'staff_id' => $data['staff_id']
                        ]);
                    } else {
                        Log::error('Failed to get staff_id from user service for transaction', [
                            'user_id' => $userId,
                            'status' => $staffResponse->status(),
                            'error' => $staffResponse->body()
                        ]);
                    }
                }
            }

            // ✅ DEBUG: Check transaction data
            Log::info('Transaction data before sending to inventory', $data);

            $response = $this->inventoryService->createTransaction($data);
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
    public function updateStaffUser(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->all();
            // ✅ CORRECTED: Handle Flutter (base64) FIRST
            if (isset($data['profile_url']) && $this->userService->isSingleBase64Image($data['profile_url'])) {
                $data['_image_type'] = 'base64';
                // Use the new base64 method
                $response = $this->userService->updateStaffUserWithBase64($id, $data);
            }
            // ✅ Then handle React.js (files)
            elseif ($request->hasFile('profile_url')) {
                $images = $request->file('profile_url');
                $data['profile_url'] = is_array($images) ? $images : [$images];
                // Use regular method for file uploads
                $response = $this->userService->updateStaffUser($id, $data);
            }
            // ✅ No images case
            else {
                Log::info('No images detected, update staff with basic data');
                $response = $this->userService->updateStaffUser($id, $data);
            }
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // // note: delete
    public function deleteStaffUser($id): JsonResponse
    {
        try {
            $response = $this->userService->deleteStaffUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: Users Routes +  Customers 
    // note: index
    public function getCustomerUsers(Request $request): JsonResponse
    {
        try {
            $response = $this->userService->getCustomerUsers($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: show
    public function getCustomerUser($id): JsonResponse
    {
        try {
            $response = $this->userService->getCustomerUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: store
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
    // note: update
    public function updateCustomerUser(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->all();
            Log::info($data);
            $response = $this->userService->updateCustomerUser($id, $data);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }
    // note: delete
    public function deleteCustomerUser($id): JsonResponse
    {
        try {
            $response = $this->userService->deleteCustomerUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: Orders Routes
    // ✅ GET /orders - List all orders with optional filters
    public function getOrders(Request $request): JsonResponse
    {
        try {
            $response = $this->orderService->getOrders($request->all());

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ GET /orders/{id} - Get single order
    public function getOrder($id): JsonResponse
    {
        try {
            $response = $this->orderService->getOrder($id);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order: ' . $e->getMessage()
            ], 500);
        }
    }
    // ✅ POST /orders - Create new order
    public function createOrder(Request $request): JsonResponse
    {
        try {
            $requestData = $request->all();

            Log::info('Received order data:', $requestData);

            // Extract staff_id from user object
            if (isset($requestData['user']['staff']['id'])) {
                $requestData['staff_id'] = $requestData['user']['staff']['id'];
                Log::info('Extracted staff_id:', ['staff_id' => $requestData['staff_id']]);
            } else {
                Log::error('Staff ID not found in user data');
                return response()->json([
                    'success' => false,
                    'message' => 'Staff ID is required'
                ], 422);
            }

            // Prepare clean data for order service
            $orderData = [
                'customer_id' => $requestData['customer_id'],
                'staff_id' => $requestData['staff_id'],
                'items' => $requestData['items']
            ];

            Log::info('Sending to order service:', $orderData);

            $response = $this->orderService->createOrder($orderData);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            Log::error('Order creation failed in gateway:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }


    // ✅ PUT /orders/{id}/status - Update order status
    public function updateOrderStatus(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,completed,cancelled'
            ]);

            $response = $this->orderService->updateOrderStatus($id, $request->status);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ DELETE /orders/{id} - Delete order
    public function deleteOrder($id): JsonResponse
    {
        try {
            $response = $this->orderService->deleteOrder($id);

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ GET /orders/reports/sales - Sales report
    public function getSalesReport(Request $request): JsonResponse
    {
        try {
            $response = $this->orderService->getSalesReport($request->all());

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sales report: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ GET /health - Health check
    public function healthCheck(): JsonResponse
    {
        try {
            $response = $this->orderService->healthCheck();

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'ERROR',
                'service' => 'IMS Order Service',
                'message' => 'Service unavailable: ' . $e->getMessage(),
                'timestamp' => now()
            ], 503);
        }
    }

    // note: HanldeServiceError
    private function handleServiceError(RequestException $e): JsonResponse
    {
        $statusCode = $e->response ? $e->response->status() : 503;
        $message = $e->response ? $e->response->json() : ['error' => 'Service unavailable'];
        return response()->json($message, $statusCode);
    }
}
