<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'icon',
        'icon_library',
        'description',
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

    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'parent_id'
        );
    }

    public function children(): HasMany
    {
        return $this->hasMany(
            Category::class,
            'parent_id'
        );
    }

    public function childrenRecursive(): HasMany
    {
        return $this->children()
            ->with('childrenRecursive')
            ->orderBy('sort_order')
            ->orderBy('name');
    }

    public function activeChildrenRecursive(): HasMany
    {
        return $this->children()
            ->where('is_active', true)
            ->with('activeChildrenRecursive')
            ->orderBy('sort_order')
            ->orderBy('name');
    }

    public function scopeRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function repairShops(): BelongsToMany
    {
        return $this
            ->belongsToMany(RepairShop::class)
            ->withPivot([
                'is_active',
                'sort_order',
            ])
            ->withTimestamps();
    }

    public function primaryRepairShops(): HasMany
    {
        return $this->hasMany(
            RepairShop::class,
            'primary_category_id',
        );
    }

}
