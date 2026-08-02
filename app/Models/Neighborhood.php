<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Neighborhood extends Model
{
    protected $fillable = [
        'city_id',
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
            'city_id' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'map_zoom' => 'integer',
        ];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function repairShops(): HasMany
    {
        return $this->hasMany(
            RepairShop::class,
        );
    }
}
