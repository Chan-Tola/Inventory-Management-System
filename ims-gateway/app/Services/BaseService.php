<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;

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
        // Get the original request's bearer token
        $token = request()->bearerToken();
        $http = Http::timeout($this->timeout)->withHeaders([
            'Authorization' => 'Bearer ' . $token, //    Forward the JWT token
            'Accept' => 'application/json',
        ]);

        $hasFiles = false;

        // Handle file uploads for POST, PUT, PATCH requests
        if (in_array($method, ['post', 'put', 'patch']) && !empty($data)) {
            $http = $this->attachFiles($http, $data, $hasFiles);
        }
        // If we have files, we need to handle data differently
        if ($hasFiles) {
            // Convert complex data to strings for multipart
            $data = $this->prepareMultipartData($data);
            $http = $http->asMultipart();
            // Log::info("Using MULTIPART format for request");
        } else {
            $http = $http->asJson();
            // Log::info("Using JSON format for request");
        }
        // ✅ ONLY log in debug mode or on errors
        $debugMode = config('app.debug') === true;

        try {
            // For GET requests with query parameters
            if ($method === 'get' && !empty($data)) {
                $response = $http->{$method}($url, $data)->throw();
            } else {
                $response = $http->{$method}($url, $data)->throw();
            }

            // ✅ Log successful requests only in debug mode
            if ($debugMode) {
                Log::debug("Service call successful: {$method} {$endpoint}", [
                    'status' => $response->status(),
                    'response_size' => strlen($response->body()) . ' bytes'
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            // ✅ ALWAYS log errors
            Log::error("Service call failed: {$method} {$endpoint}", [
                'error' => $e->getMessage(),

                'url' => $url
            ]);
            throw $e;
        }
    }

    // note: function attachFiles
    private function attachFiles($http, array &$data, &$hasFiles)
    {

        $filesToAttach = []; // change this variable name

        // Skip file processing for base64 requests
        if (isset($data['_image_type']) && $data['_image_type'] === 'base64') {
            unset($data['_image_type']);
            return $http;
        }

        foreach ($data as $key => $value) {
            if ($value instanceof \Illuminate\Http\UploadedFile) {
                // Single file
                Log::info("Attaching single file for key: {$key}", [
                    'name' => $value->getClientOriginalName()
                ]);

                $http->attach(
                    $key, // Single file - no brackets
                    file_get_contents($value->getRealPath()),
                    $value->getClientOriginalName() ?? 'file',
                    // ['Content-Type' => $value->getMimeType()]
                );
                $filesToAttach[] = $key;
                $hasFiles = true;
            } elseif (is_array($value) && !empty($value)) {
                // Check if this is an array of files
                $allFiles = true;
                foreach ($value as $item) {
                    if (!$item instanceof \Illuminate\Http\UploadedFile) {
                        $allFiles = false;
                        break;
                    }
                }
                if ($allFiles) {
                    // Multiple files - use array syntax
                    // Log::info("Attaching multiple files for key: {$key}", [
                    //     'count' => count($value)
                    // ]);
                    foreach ($value as $index => $file) {
                        $http->attach(
                            "{$key}[{$index}]", // Array syntax for multiple files
                            file_get_contents($file->getRealPath()),
                            $file->getClientOriginalName() ?? 'file',
                            // ['Content-Type' => $file->getMimeType()]
                        );
                        // Log::info("Attached file {$index}", [
                        //     'name' => $file->getClientOriginalName()
                        // ]);
                    }
                    $filesToAttach[] = $key;
                    $hasFiles = true;
                }
            }
        }

        // Remove files from data array as they're now attached
        foreach ($filesToAttach as $key) {
            unset($data[$key]);
        }

        // Log::info('Files to attach:', $filesToAttach);
        // Log::info('Data after processing:', array_keys($data));

        return $http;
    }
    //   note: Prepare data for multipart requests by converting complex types to strings
    private function prepareMultipartData(array $data): array
    {
        $multipartData = [];

        foreach ($data as $key => $value) {
            if (is_array($value) || is_object($value)) {
                // Convert arrays and object to JSON strings
                $multipartData[] = [
                    'name' => $key,
                    'contents' => json_encode($value),
                    'headers' => ['Content-Type' => 'application/json']
                ];
            } else {
                // Regular string values
                $multipartData[] = [
                    'name' => $key,
                    'contents' => (string) $value
                ];
            }
        }
        return $multipartData;
    }

    // note: Check if images array contains base64 data (for Flutter)
    public function isBase64Data(array $images): bool
    {
        foreach ($images as $image) {
            // Check for Flutter base64 format: { "data": "base64string" }
            if (is_array($image) && (isset($image['data']) || isset($image['base64']))) {
                return true;
            }
            // Check for raw base64 string: "data:image/png;base64,iVBORw0KGg..."
            if (is_string($image) && preg_match('/^data:image\/[a-z]+;base64,/', $image)) {
                return true;
            }
        }
        return false;
    }
    public function isSingleBase64Image($imageData): bool
    {
        if (!is_string($imageData)) {
            return false;
        }

        // Check for base64 string: "data:image/png;base64,iVBORw0KGg..."
        return preg_match('/^data:image\/[a-z]+;base64,/', $imageData) === 1;
    }

    // note:Get staff_id from user_id by calling user service
    public function getStaffByUser($userId): Response
    {
        return $this->get("/api/users/{$userId}/staff");
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

    //  note:Alternative method for base64 image uploads (for Flutter)
    public function makeBase64Request(string $method, string $endpoint, array $data = []): Response
    {
        $data['_image_type'] = 'base64';
        return $this->makeRequest($method, $endpoint, $data);
    }

    // note:Convenience methods for common HTTP verbs with base64
    public function postBase64(string $endpoint, array $data = []): Response
    {
        return $this->makeBase64Request('post', $endpoint, $data);
    }

    public function putBase64(string $endpoint, array $data = []): Response
    {
        return $this->makeBase64Request('put', $endpoint, $data);
    }
}
