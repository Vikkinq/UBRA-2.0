<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class JobApplicationHistory extends Model
{
    protected $fillable = [
        'action',
        'from_status_id',
        'to_status_id',
        'note',
        'changed_at',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    public function jobApplication()
    {
        return $this->belongsTo(JobApplication::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fromStatus()
    {
        return $this->belongsTo(
            MdApplicationStatus::class,
            'from_status_id'
        );
    }

    public function toStatus()
    {
        return $this->belongsTo(
            MdApplicationStatus::class,
            'to_status_id'
        );
    }
}
