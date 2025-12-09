<?php

namespace App\Services;

use Illuminate\Http\Client\Response;

class TopSellService extends BaseService
{
    public function __construct()
    {
        parent::__construct('orders');
    }

    public function getTopSellingProducts(array $query = []): Response
    {
        return $this->get("/api/top-selling", $query);
    }
}
