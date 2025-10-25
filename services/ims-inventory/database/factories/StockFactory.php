<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stock>
 */
class StockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = $this->faker->numberBetween(5, 100);
        return [
            Stock::PRODUCT_ID => Product::factory(),
            Stock::QUANTITY => $qty,
            Stock::MIN_QUANTITY => 10,
            // Stock::UNIT => fake()->randomElement(['pcs', 'boxes', 'kg', 'g', 'L', 'meters', 'pairs', 'sets']),
        ];
    }
}
