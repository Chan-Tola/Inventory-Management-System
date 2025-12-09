<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TopSaleService
{
    protected string $baseUrl;
    protected \GuzzleHttp\Client $httpClient;

    public function __construct()
    {
        $this->baseUrl = 'http://127.0.0.1:8001';
        $this->httpClient = new \GuzzleHttp\Client([
            'timeout' => 5,
            'connect_timeout' => 3,
        ]);
    }


    /**
     * Make optimized batch request
     */
    private function makeBatchRequest(array $productIds)
    {
        return Http::timeout(4)
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'X-Internal-Service' => 'ims-order-service',
                'X-Request-ID' => uniqid()
            ])
            ->post("{$this->baseUrl}/api/internal/products/batch/top-selling", [
                'product_ids' => $productIds,
                'timestamp' => time() // Prevent stale cache on inventory side
            ]);
    }


    // public function getDetailedProductsInParallel(array $productIds): array
    // {
    //     if (empty($productIds)) {
    //         return [];
    //     }

    //     // Sort and unique for consistent cache key
    //     sort($productIds);
    //     $productIds = array_values(array_unique($productIds));

    //     $cacheKey = 'sold_products_details_' . md5(implode(',', $productIds));

    //     // Try cache first
    //     $cached = Cache::get($cacheKey);
    //     if ($cached !== null) {
    //         return $cached;
    //     }

    //     try {
    //         // Single batch request for all sold products
    //         $response = $this->makeBatchRequest($productIds);
    //         $result = $this->processResponse($response);

    //         // Cache for 10 minutes
    //         Cache::put($cacheKey, $result, 600);

    //         return $result;
    //     } catch (\Exception $e) {
    //         Log::warning('Product details request failed for sold products', [
    //             'error' => $e->getMessage(),
    //             'product_count' => count($productIds)
    //         ]);

    //         // Return minimal info for sold products
    //         return $this->getFallbackDetails($productIds);
    //     }
    // }

    public function getDetailedProductsInParallel(array $productIds): array
    {
        if (empty($productIds)) {
            return [];
        }

        Log::info('📦 Fetching product details', [
            'product_ids' => $productIds,
            'count' => count($productIds),
            'inventory_url' => $this->baseUrl
        ]);

        try {
            // Remove ->wait() - just get the response directly
            $response = $this->makeBatchRequest($productIds);

            Log::info('📦 Inventory service response', [
                'status_code' => $response->status(),
                'successful' => $response->successful(),
                'body_preview' => substr($response->body(), 0, 500)
            ]);

            if ($response->successful()) {
                $result = $this->processResponse($response);
                Log::info('📦 Processed product details', [
                    'products_found' => count($result),
                    'product_ids_found' => array_keys($result)
                ]);
                return $result;
            } else {
                Log::error('📦 Inventory service error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('❌ Top-selling product request failed', [
                'error' => $e->getMessage(),
                'product_ids' => $productIds
            ]);
        }

        return [];
    }

    /**
     * Process response efficiently
     */
    private function processResponse($response): array
    {
        if (!$response || !$response->successful()) {
            return [];
        }

        $data = $response->json();
        $products = $data['data'] ?? [];

        $result = [];
        foreach ($products as $product) {
            $result[$product['id']] = [
                'id' => $product['id'],
                'name' => $product['name'] ?? 'Unknown Product',
                'sku' => $product['sku'] ?? '',
                'price' => (float) ($product['price'] ?? 0),
                'sale_price' => (float) ($product['sale_price'] ?? 0),
                'brand' => $product['brand'] ?? '',
                'category' => $product['category'] ?? null,
                'primary_image' => $product['primary_image'] ?? null,
                'current_stock' => (int) ($product['current_stock'] ?? 0),
                'is_in_stock' => (bool) ($product['is_in_stock'] ?? false)
            ];
        }

        return $result;
    }

    /**
     * Fallback details if inventory service fails
     */
    private function getFallbackDetails(array $productIds): array
    {
        $result = [];
        foreach ($productIds as $productId) {
            $result[$productId] = [
                'id' => $productId,
                'name' => 'Product #' . $productId,
                'sku' => '',
                'price' => 0,
                'sale_price' => 0,
                'brand' => '',
                'category' => null,
                'primary_image' => null,
                'current_stock' => 0,
                'is_in_stock' => false
            ];
        }
        return $result;
    }
}
