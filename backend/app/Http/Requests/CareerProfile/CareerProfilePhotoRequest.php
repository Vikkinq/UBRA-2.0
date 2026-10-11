<?php

namespace App\Http\Requests\CareerProfile;

use Illuminate\Foundation\Http\FormRequest;

class CareerProfilePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048', // KB
                'dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000',
            ],
        ];
    }
}