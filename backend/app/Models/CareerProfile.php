<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class CareerProfile extends Model
{
    public const PHOTO_DISK = 'public';

    protected $fillable = [
        'professional_title',
        'summary',
        'phone',
        'location',
        'linkedin_url',
        'github_url',
        'portfolio_url',
        'facebook_url',
        // photo_path intentionally NOT fillable: only the photo endpoints set it
    ];

    protected $hidden = ['photo_path'];

    protected $appends = ['photo_url'];

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->photo_path
            ? Storage::disk(self::PHOTO_DISK)->url($this->photo_path) // IDE Intelephense Bug
            : null
        );
    }

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
