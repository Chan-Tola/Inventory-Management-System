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
        // $this->baseUrl = env('INVENTORY_SERVICE_URL', 'http://ims-inventory:8000');
        // Use your Inventory service URL (port 8001)
        // $this->baseUrl = env('INVENTORY_SERVICE_URL', 'http://127.0.0.1:8001');
        $this->baseUrl = 'http://127.0.0.1:8001';
    }

    private function getHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'X-Internal-Service' => 'ims-order-service',
            'X-Request-ID' => uniqid()
        ];
    }
    /**
     * Build async request for product names
     */
    public function buildProductBatchRequest(array $productIds)
    {
        if (empty($productIds)) {
            return null;
        }

        return Http::timeout(8)
            ->withHeaders($this->getHeaders())
            ->async()
            ->post("{$this->baseUrl}/api/internal/products/batch", [
                'product_ids' => $productIds
            ]);
    }

    /**
     * Process product response
     */
    public function processProductResponse($response): array
    {
        if (!$response || !$response->successful()) {
            return [];
        }

        $data = $response->json();
        return collect($data['data'] ?? [])
            ->pluck('name', 'id')
            ->toArray();
    }

    /**
     * Get product names in parallel
     */
    public function getProductNamesInParallel(array $productIds): array
    {
        if (empty($productIds)) {
            return [];
        }

        $promise = $this->buildProductBatchRequest($productIds);

        try {
            $response = $promise->wait();
            return $this->processProductResponse($response);
        } catch (\Exception $e) {
            Log::error('❌ Product request failed', ['error' => $e->getMessage()]);
            return [];
        }
    }


    public function createTransaction(array $data): array
    {
        try {

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
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }


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
}
