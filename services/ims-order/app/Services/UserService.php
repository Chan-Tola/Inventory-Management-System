<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserService
{
    protected string $baseUrl;

    public function __construct()
    {
        // docker
        // $this->baseUrl = env('INVENTORY_SERVICE_URL', 'http://ims-inventory:8000');
        // Use your Inventory service URL (port 8001)
        // $this->baseUrl = env('USER_SERVICE_URL', 'http://127.0.0.1:8004');
        $this->baseUrl = 'http://127.0.0.1:8004';
    }

    private function getHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'X-Internal-Service' => 'ims-order-service',
            'X-Request-ID' => uniqid()
        ];
    }

    /**
     * Build async request for customer names
     */
    public function buildCustomerBatchRequest(array $customerIds)
    {
        if (empty($customerIds)) {
            return null;
        }

        return Http::timeout(8)
            ->withHeaders($this->getHeaders())
            ->async()
            ->post("{$this->baseUrl}/api/internal/customers/batch", [
                'customer_ids' => $customerIds
            ]);
    }

    /**
     * Build async request for staff names
     */
    public function buildStaffBatchRequest(array $staffIds)
    {
        if (empty($staffIds)) {
            return null;
        }

        return Http::timeout(8)
            ->withHeaders($this->getHeaders())
            ->async()
            ->post("{$this->baseUrl}/api/internal/staffs/batch", [
                'staff_ids' => $staffIds
            ]);
    }

    /**
     * Process customer response (simple version)
     */
    public function processCustomerResponse($response): array
    {
        if (!$response || !$response->successful()) {
            return [];
        }

        $data = $response->json();
        return collect($data['data'] ?? [])
            ->pluck('name', 'id')
            ->toArray();
    }

    /**
     * Process staff response (simple version)
     */
    public function processStaffResponse($response): array
    {
        if (!$response || !$response->successful()) {
            return [];
        }

        $data = $response->json();
        return collect($data['data'] ?? [])
            ->pluck('name', 'id')
            ->toArray();
    }

    /**
     * Get all names in parallel (convenience method)
     */
    public function getNamesInParallel(array $customerIds, array $staffIds): array
    {
        $promises = [];

        if (!empty($customerIds)) {
            $promises['customers'] = $this->buildCustomerBatchRequest($customerIds);
        }

        if (!empty($staffIds)) {
            $promises['staff'] = $this->buildStaffBatchRequest($staffIds);
        }

        // Execute in parallel
        $responses = [];
        foreach ($promises as $key => $promise) {
            try {
                $responses[$key] = $promise->wait();
            } catch (\Exception $e) {
                Log::error("❌ {$key} request failed", ['error' => $e->getMessage()]);
                $responses[$key] = null;
            }
        }

        return [
            'customers' => $this->processCustomerResponse($responses['customers'] ?? null),
            'staff' => $this->processStaffResponse($responses['staff'] ?? null)
        ];
    }
}
