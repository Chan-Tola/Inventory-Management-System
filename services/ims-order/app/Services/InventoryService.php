<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class InventoryService
{
    protected string $baseUrl;

    public function __construct()
    {
        // docker
        $this->baseUrl = env('INVENTORY_SERVICE_URL', 'http://ims-inventory:8000');
        // Use your Inventory service URL (port 8001)
        // $this->baseUrl = 'http://127.0.0.1:8001';
    }
    public function createTransaction(array $data): array
    {
        try {
            Log::info('📤 Calling inventory service INTERNAL API', $data);

            // ✅ Use INTERNAL route - no authentication required
            $response = Http::timeout(15)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'X-Internal-Service' => 'ims-order-service',
                    'X-Request-ID' => uniqid()
                ])
                ->post("{$this->baseUrl}/api/internal/transactions", $data);

            if ($response->successful()) {
                Log::info('✅ Inventory transaction created successfully via internal API');
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('❌ Inventory internal API returned error', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => 'Inventory service error: ' . $response->body(),
                'status' => $response->status()
            ];
        } catch (\Exception $e) {
            Log::error('💥 Exception calling inventory internal API', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Service unavailable: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check if a product has enough stock
     */
    public function checkStock(int $productId, int $quantity): array
    {
        try {
            // ✅ Use your stock endpoint
            $response = Http::get("{$this->baseUrl}/api/inventory/stocks/{$productId}");

            if ($response->successful()) {
                $stockData = $response->json();
                $currentStock = $stockData['data']['quantity'] ?? 0;

                return [
                    'success' => true,
                    'has_enough_stock' => $currentStock >= $quantity,
                    'current_stock' => $currentStock,
                    'requested_quantity' => $quantity
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to check stock - Status: ' . $response->status()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get product details from inventory
     */
    public function getProduct(int $productId): array
    {
        try {
            // ✅ Use your product endpoint
            $response = Http::get("{$this->baseUrl}/api/inventory/products/{$productId}");

            if ($response->successful()) {
                $productData = $response->json();
                return [
                    'success' => true,
                    'data' => $productData['data'] ?? null
                ];
            }

            return [
                'success' => false,
                'error' => 'Product not found - Status: ' . $response->status()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all products from inventory (for dropdowns)
     */
    public function getProducts(): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/api/inventory/products");

            if ($response->successful()) {
                $productsData = $response->json();
                return [
                    'success' => true,
                    'data' => $productsData['data'] ?? []
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to fetch products'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
