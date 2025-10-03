<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productName = $this->faker->unique()->word(3, true);
        // 3 = 3 names that is unique
        $price = $this->faker->randomFloat(2, 5, 200);
        // 2 = 0.00, 5= 5$ to 200 = 200$
        return [
            Product::NAME => ucwords($productName),
            Product::SKU => 'PRO-' . $this->faker->unique()->numerify('####'), // special SKU 
            Product::CATEGORY_ID => Category::factory(),
            Product::BRAND => $this->faker->company(),
            Product::PRICE => $price,
            Product::DESCRIPTION => $this->faker->paragraph(rand(2,5))
            //  2 sentences -> 5 sentences 
        ];
    }
}
