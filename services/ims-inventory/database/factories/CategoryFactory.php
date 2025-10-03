<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categoryName = $this->faker->unique()->word(3, true);
        return [
            Category::NAME => ucwords($categoryName),
            Category::DESCRIPTION => $this->faker->paragraph(2, 4)
            // 2 sentences -> 4 sentences
        ];
    }
}
