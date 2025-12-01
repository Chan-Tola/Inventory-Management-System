<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Services\CacheService;
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
    protected CacheService $cacheService;


    public function __construct(
        AuthService $authService,
        InventoryService $inventoryService,
        OrderService $orderService,
        UserService $userService,
        CacheService $cacheService,
    ) {
        $this->authService = $authService;
        $this->inventoryService = $inventoryService;
        $this->orderService = $orderService;
        $this->userService = $userService;
        $this->cacheService = $cacheService;
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

    // note: Products CRUD
    public function getProducts(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('products', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                $response = $this->inventoryService->getProducts($request->query());
                return $response->json();
            });

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

            $this->cacheService->clearByPrefix('products');

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

            $this->cacheService->clearByPrefix('products');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteProduct($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteProduct($id);

            $this->cacheService->clearByPrefix('products');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: Stock CRUD
    public function getStocks(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('stocks', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 300, function () use ($request) {
                $response = $this->inventoryService->getStocks($request->query());
                return $response->json();
            });

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

            $this->cacheService->clearByPrefix('stocks');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateStock(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateStock($id, $request->all());

            $this->cacheService->clearByPrefix('stocks');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteStock($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteStock($id);

            $this->cacheService->clearByPrefix('stocks');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: supplier CRUD
    public function getSuppliers(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->query();
            $cacheKey = $this->cacheService->generateKey('suppliers', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 1800, function () use ($request) {
                $response = $this->inventoryService->getSuppliers($request->query());
                return $response->json();
            });

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

            $this->cacheService->clearByPrefix('suppliers');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateSupplier(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateSupplier($id, $request->all());

            $this->cacheService->clearByPrefix('suppliers');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteSupplier($id): JsonResponse
    {
        try {
            $response = $this->inventoryService->deleteSupplier($id);

            $this->cacheService->clearByPrefix('suppliers');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function getTransactions(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->all();
            $cacheKey = $this->cacheService->generateKey('transactions', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 900, function () use ($request) {
                $response = $this->inventoryService->getTransactions($request->all());
                return $response->json();
            });

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

            $this->cacheService->clearByPrefix('transactions');

            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: IMS-User
    // note: Users Routes + staff
    public function getStaffUsers(Request $request): JsonResponse
    {
        try {
            $response = $this->userService->getStaffUsers($request->query());
            $data = $response->json();

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


            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function deleteStaffUser($id): JsonResponse
    {
        try {
            $response = $this->userService->deleteStaffUser($id);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    // note: Users Routes + Customers 
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

    // note: Orders Routes
    public function getOrders(Request $request): JsonResponse
    {
        try {
            $queryParams = $request->all();
            $cacheKey = $this->cacheService->generateKey('orders', $queryParams);

            $data = $this->cacheService->remember($cacheKey, 900, function () use ($request) {
                $response = $this->orderService->getOrders($request->all());
                return $response->json();
            });

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

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
    public function createOrder(Request $request): JsonResponse
    {
        try {
            $requestData = $request->all();
            $data['staff_id'] = $request->staff_id;

            $orderData = [
                'customer_id' => $requestData['customer_id'],
                'staff_id' => $requestData['staff_id'],
                'items' => $requestData['items']
            ];

            $response = $this->orderService->createOrder($orderData);

            $this->cacheService->clearByPrefix('orders');

            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }
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

    // note: HandleServiceError
    private function handleServiceError(RequestException $e): JsonResponse
    {
        $statusCode = $e->response ? $e->response->status() : 503;
        $message = $e->response ? $e->response->json() : ['error' => 'Service unavailable'];
        return response()->json($message, $statusCode);
    }
}
