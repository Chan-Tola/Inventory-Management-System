<?php

namespace App\Services;

use GuzzleHttp\Psr7\Request;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;

class InventoryService extends BaseService
{
    public function __construct()
    {
        parent::__construct('inventory');
    }
    // note: Category methods

    // note: index
    public function getCategories(array $query = []): Response
    {
        return $this->get('/api/inventory/categories', $query);
    }
    // note: show
    public function getCategory(int $id): Response
    {
        return $this->get("/api/inventory/categories/{$id}");
    }
    // note: store
    public function createCategory(array $data): Response
    {
        return $this->post('/api/inventory/categories', $data);
    }
    // note: update
    public function updateCategory(int $id, array $data): Response
    {
        return $this->put("/api/inventory/categories/{$id}", $data);
    }
    // note: delete
    public function deleteCategory(int $id): Response
    {
        return $this->delete("/api/inventory/categories/{$id}");
    }

    // note: Producst methods

    // note: index
    public function getProducts(array $query = []): Response
    {
        return $this->get('/api/inventory/products', $query);
    }
    // note: show
    public function getProduct(int $id): Response
    {
        return $this->get("/api/inventory/products/{$id}");
    }
    // note: store 
    public function createProduct(array $data): Response
    {
        // Log::info('=== INVENTORY SERVICE DEBUG ===');
        // Log::info('Data received:', [
        //     'has_images' => isset($data['images']),
        //     'has_image_type' => isset($data['_image_type']),
        //     'image_type_value' => $data['_image_type'] ?? 'not_set',
        //     'all_keys' => array_keys($data)
        // ]);
        return $this->post('/api/inventory/products', $data);
    }
    //note: update
    public function updateProduct(int $id, array $data): Response
    {
        return $this->put("/api/inventory/products/{$id}", $data);
    }
    // note:delete
    public function deleteProduct(int $id): Response
    {
        return $this->delete("/api/inventory/products/{$id}");
    }

    // note: Stock method

    // note: index
    public function getStocks(array $query = []): Response
    {
        try {
            $response = $this->get('/api/inventory/stocks', $query);

            return $response;
        } catch (\Exception $e) {
            throw $e;
        }
    }
    // note: show
    public function getStock(int $id): Response
    {
        return $this->get("/api/inventory/stocks/{$id}");
    }
    // note: store
    public function createStock(array $data): Response
    {
        return $this->post('/api/inventory/stocks', $data);
    }
    // note: update
    public function updateStock(int $id, array $data): Response
    {
        return $this->put("/api/inventory/stocks/{$id}", $data);
    }
    // note: delete
    public function deleteStock(int $id): Response
    {
        return $this->delete("/api/inventory/stocks/{$id}");
    }
}
