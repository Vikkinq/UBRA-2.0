<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MdIndustry extends Model
{
    protected $fillable = ['name'];

    public function companies()
    {
        return $this->hasMany(MdCompany::class, 'industry_id');
    }
}