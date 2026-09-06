<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class JobApplicationUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_id' => ['nullable', 'required_without:company_name', 'exists:md_companies,id'],
            'company_name' => ['nullable', 'required_without:company_id', 'string', 'max:255'],
            'status_id' => ['required', 'exists:md_application_statuses,id'],
            'employment_type_id' => ['nullable', 'exists:md_employment_types,id'],
            'source_id' => ['nullable', 'exists:md_job_sources,id'],
            'job_title' => ['required', 'string', 'max:255'],
            'job_url' => ['nullable', 'url', 'max:2048'],
            'location' => ['nullable', 'string', 'max:255'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'gte:salary_min'],
            'salary_currency' => ['nullable', 'string', 'size:3'],
            'applied_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
