<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AgencyStatus;
use App\Enums\BusinessLicenseStatus;
use App\Enums\RepairShopApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRepairShopRequest;
use App\Http\Requests\Admin\UpdateRepairShopRequest;
use App\Models\RepairShop;
use App\Services\RepairShopService;
use App\Support\RepairShops\RepairShopFormOptions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RepairShopController extends Controller
{
    public function __construct(
        private readonly RepairShopService $repairShopService,
        private readonly RepairShopFormOptions $formOptions,
    ) {
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:150',
            ],

            'approval_status' => [
                'nullable',
                Rule::enum(
                    RepairShopApprovalStatus::class,
                ),
            ],

            'activity' => [
                'nullable',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'verification' => [
                'nullable',
                Rule::in([
                    'verified',
                    'unverified',
                ]),
            ],

            'featured' => [
                'nullable',
                Rule::in([
                    'featured',
                    'normal',
                ]),
            ],

            'city_id' => [
                'nullable',
                'integer',
                Rule::exists('cities', 'id'),
            ],

            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id'),
            ],
        ]);

        $search = trim(
            $filters['search'] ?? '',
        );

        $approvalStatus =
            $filters['approval_status'] ?? null;

        $activity =
            $filters['activity'] ?? null;

        $verification =
            $filters['verification'] ?? null;

        $featured =
            $filters['featured'] ?? null;

        $cityId = isset($filters['city_id'])
            ? (int) $filters['city_id']
            : null;

        $categoryId =
            isset($filters['category_id'])
                ? (int) $filters['category_id']
                : null;

        $repairShops = RepairShop::query()
            ->select([
                'id',
                'primary_category_id',
                'city_id',

                'name',
                'slug',
                'owner_name',
                'logo_path',

                'mobile',
                'phone',

                'business_license_status',
                'approval_status',

                'is_verified',
                'is_featured',
                'is_active',

                'average_rating',
                'reviews_count',
                'sort_order',

                'created_at',
            ])
            ->with([
                'city:id,province_id,name',

                'city.province:id,name',

                'primaryCategory:id,name',
            ])
            ->withCount([
                'categories',
                'agencies',
                'serviceAreas',
            ])
            ->when(
                $search !== '',
                function (
                    Builder $query,
                ) use ($search): void {
                    $like = "%{$search}%";

                    $query->where(
                        function (
                            Builder $query,
                        ) use ($like): void {
                            $query
                                ->where(
                                    'name',
                                    'like',
                                    $like,
                                )
                                ->orWhere(
                                    'slug',
                                    'like',
                                    $like,
                                )
                                ->orWhere(
                                    'owner_name',
                                    'like',
                                    $like,
                                )
                                ->orWhere(
                                    'mobile',
                                    'like',
                                    $like,
                                )
                                ->orWhere(
                                    'phone',
                                    'like',
                                    $like,
                                )
                                ->orWhere(
                                    'union_membership_code',
                                    'like',
                                    $like,
                                )
                                ->orWhere(
                                    'business_license_number',
                                    'like',
                                    $like,
                                )
                                ->orWhereHas(
                                    'city',
                                    fn (
                                        Builder $cityQuery,
                                    ) =>
                                    $cityQuery->where(
                                        'name',
                                        'like',
                                        $like,
                                    ),
                                )
                                ->orWhereHas(
                                    'city.province',
                                    fn (
                                        Builder $provinceQuery,
                                    ) =>
                                    $provinceQuery->where(
                                        'name',
                                        'like',
                                        $like,
                                    ),
                                )
                                ->orWhereHas(
                                    'primaryCategory',
                                    fn (
                                        Builder $categoryQuery,
                                    ) =>
                                    $categoryQuery->where(
                                        'name',
                                        'like',
                                        $like,
                                    ),
                                );
                        },
                    );
                },
            )
            ->when(
                $approvalStatus,
                fn (Builder $query) =>
                $query->where(
                    'approval_status',
                    $approvalStatus,
                ),
            )
            ->when(
                $activity === 'active',
                fn (Builder $query) =>
                $query->where(
                    'is_active',
                    true,
                ),
            )
            ->when(
                $activity === 'inactive',
                fn (Builder $query) =>
                $query->where(
                    'is_active',
                    false,
                ),
            )
            ->when(
                $verification === 'verified',
                fn (Builder $query) =>
                $query->where(
                    'is_verified',
                    true,
                ),
            )
            ->when(
                $verification === 'unverified',
                fn (Builder $query) =>
                $query->where(
                    'is_verified',
                    false,
                ),
            )
            ->when(
                $featured === 'featured',
                fn (Builder $query) =>
                $query->where(
                    'is_featured',
                    true,
                ),
            )
            ->when(
                $featured === 'normal',
                fn (Builder $query) =>
                $query->where(
                    'is_featured',
                    false,
                ),
            )
            ->when(
                $cityId,
                fn (Builder $query) =>
                $query->where(
                    'city_id',
                    $cityId,
                ),
            )
            ->when(
                $categoryId,
                fn (Builder $query) =>
                $query->whereHas(
                    'categories',
                    fn (Builder $categoryQuery) =>
                    $categoryQuery->where(
                        'categories.id',
                        $categoryId,
                    ),
                ),
            )
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(
                fn (RepairShop $repairShop): array =>
                $this->toIndexItem($repairShop),
            );

        return Inertia::render(
            'admin/repair-shops/index',
            [
                'repairShops' => $repairShops,

                'filters' => [
                    'search' => $search,

                    'approval_status' =>
                        $approvalStatus,

                    'activity' => $activity,
                    'verification' => $verification,
                    'featured' => $featured,

                    'city_id' => $cityId,
                    'category_id' => $categoryId,
                ],

                'filterOptions' =>
                    $this->formOptions->filters(),
            ],
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'admin/repair-shops/create',
            [
                'options' =>
                    $this->formOptions->form(),

                /*
                 * شهرها پس از انتخاب استان دریافت می‌شوند.
                 */
                'cities' => [],

                /*
                 * محله‌ها پس از انتخاب شهر دریافت می‌شوند.
                 */
                'neighborhoods' => [],
            ],
        );
    }

    public function store(
        StoreRepairShopRequest $request,
    ): RedirectResponse {
        $this->repairShopService->create(
            $request->validated(),
        );

        return to_route(
            'admin.repair-shops.index',
        )->with(
            'success',
            'تعمیرگاه با موفقیت ایجاد شد.',
        );
    }

    public function edit(
        RepairShop $repairShop,
    ): Response {
        $repairShop->load([
            'city.province',

            'neighborhood',

            'primaryCategory',

            'categories',

            'agencies.brand',
        ]);

        $coordinates = DB::table(
            'repair_shops',
        )
            ->selectRaw(
                'ST_Longitude(location) AS longitude',
            )
            ->selectRaw(
                'ST_Latitude(location) AS latitude',
            )
            ->where(
                'id',
                $repairShop->id,
            )
            ->first();

        $serviceAreas = DB::table(
            'repair_shop_service_areas',
        )
            ->select([
                'id',
                'name',
                'description',
                'is_active',
                'sort_order',
            ])
            ->selectRaw(
                'ST_AsGeoJSON(area, 8, 0) AS geojson',
            )
            ->where(
                'repair_shop_id',
                $repairShop->id,
            )
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(
                fn (object $area): array => [
                    'id' => (int) $area->id,
                    'name' => $area->name,

                    'geojson' =>
                        $this->decodeGeoJson(
                            $area->geojson,
                        ),

                    'description' =>
                        $area->description,

                    'is_active' =>
                        (bool) $area->is_active,

                    'sort_order' =>
                        (int) $area->sort_order,
                ],
            )
            ->values()
            ->all();

        $provinceId =
            $repairShop->city?->province_id;

        return Inertia::render(
            'admin/repair-shops/edit',
            [
                'repairShop' =>
                    $this->toFormData(
                        repairShop: $repairShop,

                        longitude:
                        (float) (
                            $coordinates->longitude
                            ?? 0
                        ),

                        latitude:
                        (float) (
                            $coordinates->latitude
                            ?? 0
                        ),

                        serviceAreas:
                        $serviceAreas,
                    ),

                'options' =>
                    $this->formOptions->form(),

                'cities' => $provinceId
                    ? $this->formOptions
                        ->citiesForProvince(
                            (int) $provinceId,
                        )
                    : [],

                'neighborhoods' =>
                    $this->formOptions
                        ->neighborhoodsForCity(
                            $repairShop->city_id,
                        ),
            ],
        );
    }

    public function update(
        UpdateRepairShopRequest $request,
        RepairShop $repairShop,
    ): RedirectResponse {
        $this->repairShopService->update(
            $repairShop,
            $request->validated(),
        );

        return to_route(
            'admin.repair-shops.index',
        )->with(
            'success',
            'اطلاعات تعمیرگاه با موفقیت ویرایش شد.',
        );
    }

    public function destroy(
        RepairShop $repairShop,
    ): RedirectResponse {
        $this->repairShopService->delete(
            $repairShop,
        );

        return to_route(
            'admin.repair-shops.index',
        )->with(
            'success',
            'تعمیرگاه با موفقیت آرشیو شد.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function toIndexItem(
        RepairShop $repairShop,
    ): array {
        return [
            'id' => $repairShop->id,

            'name' => $repairShop->name,
            'slug' => $repairShop->slug,

            'owner_name' =>
                $repairShop->owner_name,

            'logo_url' =>
                $this->publicUrl(
                    $repairShop->logo_path,
                ),

            'mobile' => $repairShop->mobile,
            'phone' => $repairShop->phone,

            'city' => $repairShop->city
                ? [
                    'id' =>
                        $repairShop->city->id,

                    'name' =>
                        $repairShop->city->name,

                    'province_name' =>
                        $repairShop->city
                            ->province?->name,
                ]
                : null,

            'primary_category' =>
                $repairShop->primaryCategory
                    ? [
                    'id' =>
                        $repairShop
                            ->primaryCategory
                            ->id,

                    'name' =>
                        $repairShop
                            ->primaryCategory
                            ->name,
                ]
                    : null,

            'approval_status' =>
                $repairShop
                    ->approval_status
                    ->value,

            'approval_status_label' =>
                $repairShop
                    ->approval_status
                    ->label(),

            'business_license_status' =>
                $repairShop
                    ->business_license_status
                    ->value,

            'business_license_status_label' =>
                $repairShop
                    ->business_license_status
                    ->label(),

            'is_verified' =>
                $repairShop->is_verified,

            'is_featured' =>
                $repairShop->is_featured,

            'is_active' =>
                $repairShop->is_active,

            'average_rating' =>
                (float) $repairShop
                    ->average_rating,

            'reviews_count' =>
                $repairShop->reviews_count,

            'categories_count' =>
                $repairShop->categories_count,

            'agencies_count' =>
                $repairShop->agencies_count,

            'service_areas_count' =>
                $repairShop
                    ->service_areas_count,

            'sort_order' =>
                $repairShop->sort_order,

            'created_at' =>
                $repairShop->created_at
                    ?->toISOString(),
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $serviceAreas
     *
     * @return array<string, mixed>
     */
    private function toFormData(
        RepairShop $repairShop,
        float $longitude,
        float $latitude,
        array $serviceAreas,
    ): array {
        $categoryIds = $repairShop
            ->categories
            ->sortBy(
                fn ($category) =>
                $category->pivot->sort_order,
            )
            ->pluck('id')
            ->map(
                fn (mixed $id): int =>
                (int) $id,
            )
            ->values()
            ->all();

        return [
            'id' => $repairShop->id,

            /*
             * اطلاعات اصلی
             */
            'name' => $repairShop->name,
            'slug' => $repairShop->slug,

            'owner_name' =>
                $repairShop->owner_name,

            'professional_title' =>
                $repairShop->professional_title,

            'short_description' =>
                $repairShop->short_description,

            'description' =>
                $repairShop->description,

            /*
             * دسته‌بندی‌ها
             */
            'primary_category_id' =>
                $repairShop
                    ->primary_category_id,

            'category_ids' =>
                $categoryIds,

            /*
             * اطلاعات مکانی
             */
            'province_id' =>
                $repairShop->city
                    ?->province_id,

            'city_id' =>
                $repairShop->city_id,

            'neighborhood_id' =>
                $repairShop
                    ->neighborhood_id,

            'address' =>
                $repairShop->address,

            'postal_code' =>
                $repairShop->postal_code,

            'latitude' => $latitude,
            'longitude' => $longitude,

            /*
             * اطلاعات تماس
             */
            'mobile' =>
                $repairShop->mobile,

            'phone' =>
                $repairShop->phone,

            'whatsapp' =>
                $repairShop->whatsapp,

            'email' =>
                $repairShop->email,

            'website' =>
                $repairShop->website,

            /*
             * تصاویر
             */
            'logo_path' =>
                $repairShop->logo_path,

            'logo_url' =>
                $this->publicUrl(
                    $repairShop->logo_path,
                ),

            'cover_image_path' =>
                $repairShop
                    ->cover_image_path,

            'cover_image_url' =>
                $this->publicUrl(
                    $repairShop
                        ->cover_image_path,
                ),

            'owner_photo_path' =>
                $repairShop
                    ->owner_photo_path,

            'owner_photo_url' =>
                $this->publicUrl(
                    $repairShop
                        ->owner_photo_path,
                ),

            /*
             * اطلاعات صنفی
             */
            'union_membership_code' =>
                $repairShop
                    ->union_membership_code,

            'business_license_number' =>
                $repairShop
                    ->business_license_number,

            'business_license_issued_at' =>
                $repairShop
                    ->business_license_issued_at
                    ?->format('Y-m-d'),

            'business_license_expires_at' =>
                $repairShop
                    ->business_license_expires_at
                    ?->format('Y-m-d'),

            'business_license_status' =>
                $repairShop
                    ->business_license_status
                    ->value,

            /*
             * وضعیت‌ها
             */
            'approval_status' =>
                $repairShop
                    ->approval_status
                    ->value,

            'rejection_reason' =>
                $repairShop
                    ->rejection_reason,

            'is_union_member' =>
                $repairShop
                    ->is_union_member,

            'is_verified' =>
                $repairShop
                    ->is_verified,

            'is_featured' =>
                $repairShop
                    ->is_featured,

            'is_active' =>
                $repairShop
                    ->is_active,

            'sort_order' =>
                $repairShop
                    ->sort_order,

            'published_at' =>
                $repairShop
                    ->published_at
                    ?->format('Y-m-d\TH:i'),

            /*
             * نمایندگی‌ها
             */
            'agencies' =>
                $repairShop
                    ->agencies
                    ->map(
                        fn ($agency): array => [
                            'brand_id' =>
                                $agency->brand_id,

                            'brand_name' =>
                                $agency
                                    ->brand?->name,

                            'certificate_number' =>
                                $agency
                                    ->certificate_number,

                            'certificate_path' =>
                                $agency
                                    ->certificate_path,

                            'certificate_url' =>
                                $this->publicUrl(
                                    $agency
                                        ->certificate_path,
                                ),

                            'issued_at' =>
                                $agency
                                    ->issued_at
                                    ?->format('Y-m-d'),

                            'expires_at' =>
                                $agency
                                    ->expires_at
                                    ?->format('Y-m-d'),

                            'status' =>
                                $agency
                                    ->status
                                    ->value,

                            'is_official' =>
                                $agency
                                    ->is_official,

                            'notes' =>
                                $agency->notes,
                        ],
                    )
                    ->values()
                    ->all(),

            /*
             * محدوده‌های تحت پوشش
             */
            'service_areas' =>
                $serviceAreas,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodeGeoJson(
        ?string $geoJson,
    ): ?array {
        if (!$geoJson) {
            return null;
        }

        $decoded = json_decode(
            $geoJson,
            true,
        );

        return is_array($decoded)
            ? $decoded
            : null;
    }

    private function publicUrl(
        ?string $path,
    ): ?string {
        if (!$path) {
            return null;
        }

        return Storage::disk('public')
            ->url($path);
    }
}
