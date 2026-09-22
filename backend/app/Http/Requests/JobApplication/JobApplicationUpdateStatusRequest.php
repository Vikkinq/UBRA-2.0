<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class JobApplicationUpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Scoped so a status from another tenant/company can't be assigned here.
            'status_id' => ['required', 'exists:md_application_statuses,id'],
        ];
    }
}