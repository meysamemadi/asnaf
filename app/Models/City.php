<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'province_id',
        'name',
        'slug',
        'code',
        'sort_order',
        'is_active',
        'latitude',
        'longitude',
        'map_zoom',
    ];

    protected function casts(): array
    {
        return [
            'province_id' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'map_zoom' => 'integer',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function neighborhoods(): HasMany
    {
        return $this->hasMany(Neighborhood::class)
            ->orderBy('sort_order')
            ->orderBy('name');
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
