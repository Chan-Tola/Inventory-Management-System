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
    public function deleteUser(int $id): Response
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
