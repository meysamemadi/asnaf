<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'logo_path',
        'description',
        'website',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function agencies(): HasMany
    {
        return $this->hasMany(
            RepairShopAgency::class,
        );
    }

    public function repairShops(): BelongsToMany
    {
        return $this
            ->belongsToMany(
                RepairShop::class,
                'repair_shop_agencies',
            )
            ->withPivot([
                'certificate_number',
                'certificate_path',
                'issued_at',
                'expires_at',
                'status',
                'is_official',
                'notes',
            ])
            ->withTimestamps();
    }
}
