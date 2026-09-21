<?php

namespace Database\Seeders;

use App\Models\MdCompany;
use App\Models\MdIndustry;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            // Information Technology
            [
                'name' => 'IBM',
                'industry' => 'information_technology',
                'website' => 'https://www.ibm.com',
            ],
            [
                'name' => 'Microsoft',
                'industry' => 'information_technology',
                'website' => 'https://www.microsoft.com',
            ],

            // Software Development
            [
                'name' => 'Google',
                'industry' => 'software_development',
                'website' => 'https://www.google.com',
            ],
            [
                'name' => 'Atlassian',
                'industry' => 'software_development',
                'website' => 'https://www.atlassian.com',
            ],

            // Finance & Banking
            [
                'name' => 'BDO Unibank',
                'industry' => 'finance_banking',
                'website' => 'https://www.bdo.com.ph',
            ],
            [
                'name' => 'Bank of the Philippine Islands',
                'industry' => 'finance_banking',
                'website' => 'https://www.bpi.com.ph',
            ],

            // Healthcare
            [
                'name' => 'St. Luke’s Medical Center',
                'industry' => 'healthcare',
                'website' => 'https://www.stlukes.com.ph',
            ],
            [
                'name' => 'The Medical City',
                'industry' => 'healthcare',
                'website' => 'https://www.themedicalcity.com',
            ],

            // Education
            [
                'name' => 'University of the Philippines',
                'industry' => 'education',
                'website' => 'https://up.edu.ph',
            ],
            [
                'name' => 'Ateneo de Manila University',
                'industry' => 'education',
                'website' => 'https://www.ateneo.edu',
            ],

            // Manufacturing
            [
                'name' => 'Toyota Motor Philippines',
                'industry' => 'manufacturing',
                'website' => 'https://www.toyota.com.ph',
            ],
            [
                'name' => 'Nestlé Philippines',
                'industry' => 'manufacturing',
                'website' => 'https://www.nestle.com.ph',
            ],

            // Retail
            [
                'name' => 'SM Retail',
                'industry' => 'retail',
                'website' => 'https://www.smretail.com',
            ],
            [
                'name' => 'Robinsons Retail',
                'industry' => 'retail',
                'website' => 'https://www.robinsonsretailholdings.com.ph',
            ],

            // Government
            [
                'name' => 'Department of Information and Communications Technology',
                'industry' => 'government',
                'website' => 'https://dict.gov.ph',
            ],
            [
                'name' => 'Department of Education',
                'industry' => 'government',
                'website' => 'https://www.deped.gov.ph',
            ],

            // Marketing & Advertising
            [
                'name' => 'Ogilvy',
                'industry' => 'marketing_advertising',
                'website' => 'https://www.ogilvy.com',
            ],
            [
                'name' => 'Publicis Groupe',
                'industry' => 'marketing_advertising',
                'website' => 'https://www.publicisgroupe.com',
            ],

            // Engineering
            [
                'name' => 'AECOM',
                'industry' => 'engineering',
                'website' => 'https://www.aecom.com',
            ],
            [
                'name' => 'Jacobs',
                'industry' => 'engineering',
                'website' => 'https://www.jacobs.com',
            ],
        ];

        foreach ($companies as $company) {
            $industryId = MdIndustry::where(
                'key',
                $company['industry']
            )->value('id');

            MdCompany::updateOrCreate(
                ['name' => $company['name']],
                [
                    'industry_id' => $industryId,
                    'website' => $company['website'],
                    'logo_url' => null,
                ]
            );
        }
    }
}