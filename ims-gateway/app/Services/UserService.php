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

    public function getUsers(array $query = []): Response
    {
        return $this->get('/api/users', $query);
    }
}
