<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class BaseService
{
    protected string $baseUrl;
    protected int $timeout;
    public function __construct(string $serviceName)
    {
        $config = config("services.services.{$serviceName}");
        $this->baseUrl = $config['base_url'];
        $this->timeout = $config['timeout'];
    }

    // note: function makeRequest
    protected function makeRequest(string $method, string $endpoint, array $data = []): Response
    {
        $url = $this->baseUrl . $endpoint;

        //note: For GET requests, use query parameters
        if ($method === 'get' && !empty($data)) {
            return Http::timeout($this->timeout)
                ->{$method}($url, $data)
                ->throw();
        }

        //note: For other methods, use form data
        return Http::timeout($this->timeout)
            ->{$method}($url, $data)
            ->throw();
    }

    protected function get(string $endpoint, array $query = []): Response
    {
        return $this->makeRequest('get', $endpoint, $query);
    }

    protected function post(string $endpoint, array $data = []): Response
    {
        return $this->makeRequest('post', $endpoint, $data);
    }

    protected function put(string $endpoint, array $data = []): Response
    {
        return $this->makeRequest('put', $endpoint, $data);
    }

    protected function patch(string $endpoint, array $data = []): Response
    {
        return $this->makeRequest('patch', $endpoint, $data);
    }

    protected function delete(string $endpoint): Response
    {
        return $this->makeRequest('delete', $endpoint);
    }
}
