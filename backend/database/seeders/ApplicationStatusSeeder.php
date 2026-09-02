<?php

namespace Database\Seeders;

use App\Models\MdApplicationStatus;
use Illuminate\Database\Seeder;

class ApplicationStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            'Applied',
            'Screening',
            'Interview',
            'Offer',
            'Accepted',
            'Rejected',
            'Withdrawn',
        ];

        foreach ($statuses as $index => $name) {
            MdApplicationStatus::updateOrCreate(
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