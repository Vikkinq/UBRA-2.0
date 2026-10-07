<?php

namespace App\Http\Requests\JobInterview;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JobInterviewStoreRequest extends FormRequest
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
            'job_application_id' => [
                'required',
                'integer',
                Rule::exists('job_applications', 'id')
                    ->where('user_id', $this->user()->id)
                    ->whereNull('deleted_at'),
            ],
            'interview_type' => ['nullable', 'string', 'max:255'],
            'round_name' => ['nullable', 'string', 'max:255'],
            'scheduled_at' => ['nullable', 'date'],
            'duration' => ['nullable', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url', 'max:255'],
            'interviewer_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'outcome' => ['nullable', 'string', 'max:255'],
        ];
    }
}
