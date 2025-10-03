<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        // note: Factory categories
        Category::factory()->count(3)->create();
        // note: Seeder categories
        // $categories = [
        //     [
        //         Category::NAME => 'Laptop',
        //         Category::DESCRIPTION => 'Dell, Asus, and others..',
        //     ],
        //     [
        //         Category::NAME => 'Phone',
        //         Category::DESCRIPTION => 'Iphone, Samsung, and others..',
        //     ],
        // ];

        // foreach($categories as $category){
        //     Category::create($category);
        // }
    }
}
