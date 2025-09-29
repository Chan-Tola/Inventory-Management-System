<?php

namespace App\Services;

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

    public function getProducts(array $query = []): Response
    {
        return $this->get('/api/inventory/products', $query);
    }
}
