<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobInterview extends Model
{
    protected $fillable = [
        'job_application_id',
        'interview_type',
        'round_name',
        'scheduled_at',
        'duration',
        'location',
        'meeting_url',
        'interviewer_name',
        'notes',
        'outcome',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'duration' => 'integer',
        ];
    }

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }
}
