<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairShopServiceArea extends Model
{
    protected $fillable = [
        'repair_shop_id',
        'name',
        'area',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $hidden = [
        'area',
    ];

    protected function casts(): array
    {
        return [
            'repair_shop_id' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function repairShop(): BelongsTo
    {
        return $this->belongsTo(
            RepairShop::class,
        );
    }

    public function scopeActive(
        Builder $query,
    ): Builder {
        return $query->where('is_active', true);
    }
}
