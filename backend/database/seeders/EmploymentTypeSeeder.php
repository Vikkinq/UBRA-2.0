<?php

namespace Database\Seeders;

use App\Models\MdEmploymentType;
use Illuminate\Database\Seeder;

class EmploymentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Full-time',
            'Part-time',
            'Contract',
            'Internship',
            'Freelance',
        ];

        foreach ($types as $index => $name) {
            MdEmploymentType::updateOrCreate(
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