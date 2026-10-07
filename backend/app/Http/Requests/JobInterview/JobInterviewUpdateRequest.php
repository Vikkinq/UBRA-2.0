<?php

namespace App\Http\Requests\JobInterview;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class JobInterviewUpdateRequest extends FormRequest
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
            'interview_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'round_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'scheduled_at' => ['sometimes', 'nullable', 'date'],
            'duration' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'meeting_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'interviewer_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'outcome' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
