<?php

namespace App\Models;

use App\Enums\BusinessLicenseStatus;
use App\Enums\RepairShopApprovalStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RepairShop extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'primary_category_id',
        'city_id',
        'neighborhood_id',

        'name',
        'slug',
        'owner_name',
        'professional_title',
        'short_description',
        'description',

        'logo_path',
        'cover_image_path',
        'owner_photo_path',

        'mobile',
        'phone',
        'whatsapp',
        'email',
        'website',

        'address',
        'postal_code',
        'location',

        'union_membership_code',
        'business_license_number',
        'business_license_issued_at',
        'business_license_expires_at',
        'business_license_status',

        'approval_status',
        'rejection_reason',

        'is_union_member',
        'is_verified',
        'is_featured',
        'is_active',

        'sort_order',
        'published_at',

        'average_rating',
        'reviews_count',
    ];

    /*
     * برای جلوگیری از ارسال تصادفی مقدار باینری
     * ستون Spatial به Inertia یا API.
     */
    protected $hidden = [
        'location',
    ];

    protected function casts(): array
    {
        return [
            'primary_category_id' => 'integer',
            'city_id' => 'integer',
            'neighborhood_id' => 'integer',

            'business_license_issued_at' => 'date',
            'business_license_expires_at' => 'date',

            'business_license_status' =>
                BusinessLicenseStatus::class,

            'approval_status' =>
                RepairShopApprovalStatus::class,

            'is_union_member' => 'boolean',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',

            'sort_order' => 'integer',
            'published_at' => 'datetime',

            'average_rating' => 'decimal:2',
            'reviews_count' => 'integer',
        ];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function primaryCategory(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'primary_category_id',
        );
    }

    public function categories(): BelongsToMany
    {
        return $this
            ->belongsToMany(Category::class)
            ->withPivot([
                'is_active',
                'sort_order',
            ])
            ->withTimestamps();
    }

    public function agencies(): HasMany
    {
        return $this->hasMany(
            RepairShopAgency::class,
        );
    }

    public function brands(): BelongsToMany
    {
        return $this
            ->belongsToMany(
                Brand::class,
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

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(
            RepairShopServiceArea::class,
        );
    }

    public function scopeActive(
        Builder $query,
    ): Builder {
        return $query->where('is_active', true);
    }

    public function scopeApproved(
        Builder $query,
    ): Builder {
        return $query->where(
            'approval_status',
            RepairShopApprovalStatus::Approved->value,
        );
    }

    public function scopePublished(
        Builder $query,
    ): Builder {
        return $query
            ->active()
            ->approved()
            ->whereNotNull('published_at')
            ->where(
                'published_at',
                '<=',
                now(),
            );
    }
}
