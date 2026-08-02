<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'sort_order',
        'is_active',
        'latitude',
        'longitude',
        'map_zoom',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'map_zoom' => 'integer',
        ];
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class)
            ->orderBy('sort_order')
            ->orderBy('name');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
