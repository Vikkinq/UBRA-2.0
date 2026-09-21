<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MdCompany extends Model
{
    protected $fillable = [
        'name',
        'industry_id',
        'website',
        'logo_url',
    ];

    public function industry()
    {
        return $this->belongsTo(MdIndustry::class, 'industry_id');
    }
}