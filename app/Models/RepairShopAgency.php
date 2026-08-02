<?php

namespace App\Models;

use App\Enums\AgencyStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairShopAgency extends Model
{
    protected $fillable = [
        'repair_shop_id',
        'brand_id',
        'certificate_number',
        'certificate_path',
        'issued_at',
        'expires_at',
        'status',
        'is_official',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'repair_shop_id' => 'integer',
            'brand_id' => 'integer',

            'issued_at' => 'date',
            'expires_at' => 'date',

            'status' => AgencyStatus::class,
            'is_official' => 'boolean',
        ];
    }

    public function repairShop(): BelongsTo
    {
        return $this->belongsTo(
            RepairShop::class,
        );
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(
            Brand::class,
        );
    }
}
