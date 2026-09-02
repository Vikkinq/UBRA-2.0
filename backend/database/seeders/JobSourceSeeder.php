<?php

namespace Database\Seeders;

use App\Models\MdJobSource;
use Illuminate\Database\Seeder;

class JobSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            'LinkedIn',
            'Indeed',
            'Company Website',
            'Referral',
            'Job Fair',
            'Recruiter',
            'Other',
        ];

        foreach ($sources as $index => $name) {
            MdJobSource::updateOrCreate(
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