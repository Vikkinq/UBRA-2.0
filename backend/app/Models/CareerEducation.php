<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class CareerEducation extends Model
{
    protected $table = 'career_educations';

    protected $fillable = [
        'career_profile_id',
        'education_level',
        'institution_name',
        'degree',
        'field_of_study',
        'location',
        'start_date',
        'end_date',
        'is_currently_enrolled',
        'description',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_currently_enrolled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function careerProfile(): BelongsTo
    {
        return $this->belongsTo(CareerProfile::class);
    }
}
