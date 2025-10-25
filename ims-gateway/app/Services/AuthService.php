<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthService extends BaseService
{
    public function __construct()
    {
        parent::__construct('users');
    }

    // note: login function
    public function login(array $credentials): Response
    {
        return $this->post('/api/auth/login', $credentials);
    }
    // note: register function
    // public function register():Response{

    // }
    
    // note: logout function
    public function logout(string $token): Response
    {
        // Use full URL with baseUrl
        $url = $this->baseUrl . '/api/auth/logout';

        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->timeout(30)->post($url);
    }


    public function validateToken(string $token): Response
    {
        // Use full URL with baseUrl
        $url = $this->baseUrl . '/api/auth/validate';

        Log::info('AuthService: Validating token', [
            'base_url' => $this->baseUrl,
            'full_url' => $url
        ]);

        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->timeout(30)->get($url);
    }
}
