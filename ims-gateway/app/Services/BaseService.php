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
        $http = Http::timeout($this->timeout);

        // handle file uploads for POST, PUT, PATCH requests
        if (in_array($method, ['post', 'put', 'patch']) && !empty($data)) {
            $http = $this->attachFiles($http, $data);
        }

        // for GET requests with query parameters
        if ($method === 'get' && !empty($data)) {
            return $http->{$method}($url, $data)->throw();
        }
        // for other methods with data
        return $http->{$method}($url, $data)->throw();
    }

    // note: function attachFiles
    private function attachFiles($http, array &$data)
    {
        $filesToAttach = []; // change this variable name

        // Skip file processing for base64 requests
        if (isset($data['_image_type']) && $data['_image_type'] === 'base64') {
            unset($data['_image_type']); // clean up flag
            return $http->asJson();
        }
        foreach ($data as $key => $value) {
            if ($value instanceof \Illuminate\Http\UploadedFile) {
                // single file
                $http->attach(
                    $key . '[]', // Use brackets for array
                    file_get_contents($value->getRealPath()),
                    $value->getClientOriginalName()
                );
                $filesToAttach[] = $key; // use consistent variable name
            } elseif (is_array($value) && !empty($value) && $value[0] instanceof \Illuminate\Http\UploadedFile) {
                // array of files
                foreach ($value as $index => $file) {
                    $http->attach(
                        "{$key}[{$index}]",
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    );
                }
                $filesToAttach[] = $key; //use consistent variable name
            }
        }

        // remove files from data array as they're now attached
        foreach ($filesToAttach as $key) {
            unset($data[$key]);
        }

        return $http;
    }

    // note: CRUD ( Create (post), Read (get), Update (put), Delete (delete) )

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
