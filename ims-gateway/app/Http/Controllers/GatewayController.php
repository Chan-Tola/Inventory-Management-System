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
        UserService $userService
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
            Log::info('Gateway: Logout request');

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
            $response = $this->inventoryService->createCategory($request->all());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    //note: update
    public function updateCategory(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateCategory($id, $request->all());
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

            // get all form data (text fields) from the request
            $data = $request->all();
            // handle files properly - ensure images is always an array
            if ($request->hasFile('images')) {
                /*
                This is important!    
                If only one file is uploaded, $images is a single UploadedFile object
                If multiple files are uploaded, $images is an array of UploadedFile objects
                 We convert single file to array so we always work with arrays
                 */
                $images = $request->file('images');
                $data['images'] = is_array($images) ? $images : [$images];
            }

            // Handle base64 images (new system) 
            elseif (isset($data['images']) && is_array($data['images'])) {
                // base64  image are already in data, just mark them
                $data['_image_type'] = 'base64';
            }

            $response = $this->inventoryService->createProduct($data);
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
        }
    }

    public function updateProduct(Request $request, $id): JsonResponse
    {
        try {
            $response = $this->inventoryService->updateProduct($id, $request->all());
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
    // note: Users Routes
    public function getUsers(Request $request): JsonResponse
    {
        try {
            $response = $this->userService->getUsers($request->query());
            return response()->json($response->json(), $response->status());
        } catch (RequestException $e) {
            return $this->handleServiceError($e);
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
