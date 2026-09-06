<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_id',
        'company_name',
        'status_id',
        'employment_type_id',
        'source_id',
        'job_title',
        'job_url',
        'location',
        'salary_min',
        'salary_max',
        'salary_currency',
        'applied_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'date',
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(MdCompany::class, 'company_id');
    }

    public function status()
    {
        return $this->belongsTo(MdApplicationStatus::class, 'status_id');
    }

    public function employmentType()
    {
        return $this->belongsTo(MdEmploymentType::class, 'employment_type_id');
    }

    public function source()
    {
        return $this->belongsTo(MdJobSource::class, 'source_id');
    }

    public function history()
    {
        return $this->hasMany(JobApplicationHistory::class);
    }

    public function interviews()
    {
        return $this->hasMany(JobInterview::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}