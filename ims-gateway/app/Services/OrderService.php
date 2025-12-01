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

    // ✅ Get all orders with optional filters
    public function getOrders(array $query = []): Response
    {
        return $this->get('/api/orders', $query);
    }

    // ✅ Get single order by ID
    public function getOrder($id): Response
    {
        return $this->get("/api/orders/{$id}");
    }

    // ✅ Create new order
    public function createOrder(array $data): Response
    {
        // Extract staff_id from user object if it exists
        if (isset($data['user']['staff']['id'])) {
            $data['staff_id'] = $data['user']['staff']['id'];
        }

        // Remove the nested user data to avoid validation issues
        unset($data['user'], $data['user_id'], $data['user_permission'], $data['user_roles']);

        return $this->post('/api/orders', $data);
    }

    // ✅ Update order status
    public function updateOrderStatus($id, string $status): Response
    {
        return $this->put("/api/orders/{$id}/status", ['status' => $status]);
    }

    // ✅ Delete order
    public function deleteOrder($id): Response
    {
        return $this->delete("/api/orders/{$id}");
    }

}
