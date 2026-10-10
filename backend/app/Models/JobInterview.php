<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class JobInterview extends Model
{
    protected $fillable = [
        'user_id',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId)
            ->whereHas('jobApplication', fn ($q) => $q->where('user_id', $userId));
    }
}
