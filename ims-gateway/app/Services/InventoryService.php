<?php

namespace App\Services;

use GuzzleHttp\Psr7\Request;
use Illuminate\Http\Client\Response;

class InventoryService extends BaseService
{
    /**
     * Create a new class instance.
     */
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
}
