<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class CareerExperience extends Model
{
    protected $fillable = [
        'career_profile_id',
        'job_title',
        'company_name',
        'location',
        'employment_type_id',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function careerProfile(): BelongsTo
    {
        return $this->belongsTo(CareerProfile::class);
    }

    public function employmentType(): BelongsTo
    {
        return $this->belongsTo(MdEmploymentType::class, 'employment_type_id');
    }
}
