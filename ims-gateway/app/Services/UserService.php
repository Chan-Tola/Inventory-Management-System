<?php

namespace App\Services;

use Illuminate\Http\Client\Response;

class UserService extends BaseService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        parent::__construct('users');
    }

    // note: index
    public function getStaffUsers(array $query = []): Response
    {
        return $this->get('/api/users/staffs', $query);
    }
    // note: show by id
    public function getStaffUser(int $id): Response
    {
        return $this->get("/api/users/staffs/{$id}");
    }
    // note: store
    public function createStaffUser(array $data): Response
    {
        return $this->post('/api/users/staffs', $data);
    }
    // note: update
    public function updateStaffUser(int $id, array $data): Response
    {
        return $this->put("/api/users/staffs/{$id}", $data);
    }
    // note: delete
    public function deleteStaffUser(int $id): Response
    {
        return $this->delete("/api/users/staffs/{$id}");
    }

    // get the user id
    public function getStaffByUser($userId): Response
    {
        return $this->get("/api/users/{$userId}/staff");
    }

    /**
     * Create product with base64 images (for Flutter)
     */

    // note: index
    public function getCustomerUsers(array $query = []): Response
    {
        return $this->get('/api/users/customers', $query);
    }
    // note: show by id
    public function getCustomerUser(int $id): Response
    {
        return $this->get("/api/users/customers/{$id}");
    }
    // note: store
    public function createCustomerUser(array $data): Response
    {
        return $this->post('/api/users/customers', $data);
    }
    // note: update
    public function updateCustomerUser(int $id, array $data): Response
    {
        return $this->put("/api/users/customers/{$id}", $data);
    }
    // note: delete
    public function deleteCustomerUser(int $id): Response
    {
        return $this->delete("/api/users/customers/{$id}");
    }
    
    /**
     * Create product with base64 images (for Flutter)
     */
    public function createStaffUserWithBase64(array $data): Response
    {
        return $this->postBase64('/api/users/staffs', $data);
    }

    /**
     * Update product with base64 images (for Flutter)
     */
    public function updateStaffUserWithBase64(int $id, array $data): Response
    {
        return $this->putBase64("/api/users/staffs/{$id}", $data);
    }
}
