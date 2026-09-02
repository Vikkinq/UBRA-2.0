<?php

namespace Database\Seeders;

use App\Models\MdIndustry;
use Illuminate\Database\Seeder;

class IndustrySeeder extends Seeder
{
    public function run(): void
    {
        $industries = [
            'Information Technology',
            'Software Development',
            'Finance & Banking',
            'Healthcare',
            'Education',
            'Manufacturing',
            'Retail',
            'Government',
            'Marketing & Advertising',
            'Engineering',
        ];

        foreach ($industries as $index => $name) {
            MdIndustry::updateOrCreate(
                ['key' => str($name)->slug('_')],
                [
                    'name' => $name,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }
    }
}