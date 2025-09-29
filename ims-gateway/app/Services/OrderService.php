<?php

namespace App\Services;

use Illuminate\Http\Client\Response;

class OrderService extends BaseService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        parent::__construct('orders');
    }

    public function getOrders(array $query = []): Response
    {
        return $this->get('/api/orders', $query);
    }
}
