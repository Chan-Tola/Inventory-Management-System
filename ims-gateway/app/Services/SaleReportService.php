<?php

namespace App\Services;

use Illuminate\Http\Client\Response;

class SaleReportService extends BaseService
{
    public function __construct()
    {
        parent::__construct('orders');
    }

    public function getReport(array $params = []): Response
    {
        // Just forward the request to order service
        // Order service will handle the date logic
        return $this->get("/api/sale-reports", $params);
    }
}
