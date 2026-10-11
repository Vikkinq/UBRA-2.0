<?php

namespace App\Http\Requests\CareerProfile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CareerProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Profile fields
            'professional_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'summary' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'linkedin_url' => ['sometimes', 'nullable', 'url:http,https', 'max:255'],
            'github_url' => ['sometimes', 'nullable', 'url:http,https', 'max:255'],
            'portfolio_url' => ['sometimes', 'nullable', 'url:http,https', 'max:255'],
            'facebook_url' => ['sometimes', 'nullable', 'url:http,https', 'max:255'],

            // Experiences
            'experiences' => ['sometimes', 'array', 'max:50'],
            'experiences.*' => [
                'required',
                'array:id,job_title,company_name,location,employment_type_id,start_date,end_date,is_current,description',
            ],
            'experiences.*.id' => ['sometimes', 'nullable', 'integer', 'distinct'],
            'experiences.*.job_title' => ['required', 'string', 'max:255'],
            'experiences.*.company_name' => ['required', 'string', 'max:255'],
            'experiences.*.location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'experiences.*.employment_type_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('md_employment_types', 'id')->where('is_active', true),
            ],
            'experiences.*.start_date' => ['required', 'date_format:Y-m-d'],
            'experiences.*.end_date' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:experiences.*.start_date',
            ],
            'experiences.*.is_current' => ['sometimes', 'boolean'],
            'experiences.*.description' => ['sometimes', 'nullable', 'string', 'max:5000'],

            // Educations
            'educations' => ['sometimes', 'array', 'max:20'],
            'educations.*' => [
                'required',
                'array:id,education_level,institution_name,degree,field_of_study,location,start_date,end_date,is_currently_enrolled,description',
            ],
            'educations.*.id' => ['sometimes', 'nullable', 'integer', 'distinct'],
            'educations.*.education_level' => ['required', 'string', 'max:100'],
            'educations.*.institution_name' => ['required', 'string', 'max:255'],
            'educations.*.degree' => ['sometimes', 'nullable', 'string', 'max:255'],
            'educations.*.field_of_study' => ['sometimes', 'nullable', 'string', 'max:255'],
            'educations.*.location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'educations.*.start_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'educations.*.end_date' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:educations.*.start_date',
            ],
            'educations.*.is_currently_enrolled' => ['sometimes', 'boolean'],
            'educations.*.description' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}