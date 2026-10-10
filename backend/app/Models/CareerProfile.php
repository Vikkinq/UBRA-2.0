<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class CareerProfile extends Model
{
    protected $fillable = [
        'professional_title',
        'summary',
        'phone',
        'location',
        'linkedin_url',
        'github_url',
        'portfolio_url',
        'facebook_url',
        'photo_path',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(CareerExperience::class)->orderBy('sort_order');
    }

    public function educations(): HasMany
    {
        return $this->hasMany(CareerEducation::class)->orderBy('sort_order');
    }
}
