<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNeighborhoodRequest;
use App\Http\Requests\Admin\UpdateNeighborhoodRequest;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Province;
use App\Services\NeighborhoodService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NeighborhoodController extends Controller
{
    public function __construct(
        private readonly NeighborhoodService $neighborhoodService,
    ) {
    }

    public function index(
        Request $request,
    ): Response {
        $filters = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:120',
            ],

            'province_id' => [
                'nullable',
                'integer',
                'exists:provinces,id',
            ],

            'city_id' => [
                'nullable',
                'integer',
                'exists:cities,id',
            ],

            'status' => [
                'nullable',
                'in:all,active,inactive',
            ],
        ]);

        $search = trim(
            $filters['search'] ?? '',
        );

        $provinceId =
            isset($filters['province_id'])
                ? (int) $filters['province_id']
                : null;

        $cityId =
            isset($filters['city_id'])
                ? (int) $filters['city_id']
                : null;

        $status =
            $filters['status'] ?? 'all';

        $neighborhoods =
            Neighborhood::query()
                ->select([
                    'id',
                    'city_id',
                    'name',
                    'slug',

                    'latitude',
                    'longitude',
                    'map_zoom',

                    'sort_order',
                    'is_active',
                    'created_at',
                ])
                ->with([
                    'city:id,province_id,name,is_active',

                    'city.province:id,name,is_active',
                ])
                ->withCount(
                    'repairShops',
                )
                ->when(
                    $search !== '',
                    function ($query) use (
                        $search,
                    ): void {
                        $query->where(
                            function ($query) use (
                                $search,
                            ): void {
                                $query
                                    ->where(
                                        'name',
                                        'like',
                                        "%{$search}%",
                                    )
                                    ->orWhere(
                                        'slug',
                                        'like',
                                        "%{$search}%",
                                    );
                            },
                        );
                    },
                )
                ->when(
                    $provinceId !== null,
                    fn ($query) =>
                    $query->whereHas(
                        'city',
                        fn ($query) =>
                        $query->where(
                            'province_id',
                            $provinceId,
                        ),
                    ),
                )
                ->when(
                    $cityId !== null,
                    fn ($query) =>
                    $query->where(
                        'city_id',
                        $cityId,
                    ),
                )
                ->when(
                    $status === 'active',
                    fn ($query) =>
                    $query->where(
                        'is_active',
                        true,
                    ),
                )
                ->when(
                    $status === 'inactive',
                    fn ($query) =>
                    $query->where(
                        'is_active',
                        false,
                    ),
                )
                ->orderBy('city_id')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->paginate(15)
                ->withQueryString()
                ->through(
                    fn (
                        Neighborhood $neighborhood,
                    ): array => [
                        'id' =>
                            $neighborhood->id,

                        'city_id' =>
                            $neighborhood->city_id,

                        'city' =>
                            $neighborhood->city
                                ? [
                                'id' =>
                                    $neighborhood
                                        ->city
                                        ->id,

                                'name' =>
                                    $neighborhood
                                        ->city
                                        ->name,

                                'is_active' =>
                                    $neighborhood
                                        ->city
                                        ->is_active,

                                'province' =>
                                    $neighborhood
                                        ->city
                                        ->province
                                        ? [
                                        'id' =>
                                            $neighborhood
                                                ->city
                                                ->province
                                                ->id,

                                        'name' =>
                                            $neighborhood
                                                ->city
                                                ->province
                                                ->name,

                                        'is_active' =>
                                            $neighborhood
                                                ->city
                                                ->province
                                                ->is_active,
                                    ]
                                        : null,
                            ]
                                : null,

                        'name' =>
                            $neighborhood->name,

                        'slug' =>
                            $neighborhood->slug,

                        'latitude' =>
                            $neighborhood->latitude,

                        'longitude' =>
                            $neighborhood->longitude,

                        'map_zoom' =>
                            $neighborhood->map_zoom,

                        'sort_order' =>
                            $neighborhood->sort_order,

                        'is_active' =>
                            $neighborhood->is_active,

                        'repair_shops_count' =>
                            $neighborhood
                                ->repair_shops_count,

                        'created_at' =>
                            $neighborhood
                                ->created_at
                                ?->toISOString(),
                    ],
                );

        return Inertia::render(
            'admin/neighborhoods/index',
            [
                'neighborhoods' =>
                    $neighborhoods,

                'filters' => [
                    'search' => $search,

                    'province_id' =>
                        $provinceId,

                    'city_id' =>
                        $cityId,

                    'status' =>
                        $status,
                ],

                'provinces' =>
                    $this->provinceOptions(),

                'cities' =>
                    $provinceId !== null
                        ? $this->cityOptions(
                        $provinceId,
                    )
                        : [],
            ],
        );
    }

    public function create(
        Request $request,
    ): Response {
        $provinceId =
            $request->integer(
                'province_id',
            ) ?: null;

        return Inertia::render(
            'admin/neighborhoods/create',
            [
                'provinces' =>
                    $this->provinceOptions(),

                'cities' =>
                    $provinceId !== null
                        ? $this->cityOptions(
                        $provinceId,
                    )
                        : [],

                'selectedProvinceId' =>
                    $provinceId,
            ],
        );
    }

    public function store(
        StoreNeighborhoodRequest $request,
    ): RedirectResponse {
        $this->neighborhoodService
            ->create(
                $request->validated(),
            );

        return to_route(
            'admin.neighborhoods.index',
        )->with(
            'success',
            'محله با موفقیت ایجاد شد.',
        );
    }

    public function edit(
        Neighborhood $neighborhood,
    ): Response {
        $neighborhood->load(
            'city:id,province_id,name',
        );

        return Inertia::render(
            'admin/neighborhoods/edit',
            [
                'neighborhood' => [
                    'id' =>
                        $neighborhood->id,

                    'province_id' =>
                        $neighborhood
                            ->city
                            ->province_id,

                    'city_id' =>
                        $neighborhood->city_id,

                    'name' =>
                        $neighborhood->name,

                    'slug' =>
                        $neighborhood->slug,

                    'latitude' =>
                        $neighborhood->latitude,

                    'longitude' =>
                        $neighborhood->longitude,

                    'map_zoom' =>
                        $neighborhood->map_zoom,

                    'sort_order' =>
                        $neighborhood->sort_order,

                    'is_active' =>
                        $neighborhood->is_active,
                ],

                'provinces' =>
                    $this->provinceOptions(),

                'cities' =>
                    $this->cityOptions(
                        $neighborhood
                            ->city
                            ->province_id,
                    ),
            ],
        );
    }

    public function update(
        UpdateNeighborhoodRequest $request,
        Neighborhood $neighborhood,
    ): RedirectResponse {
        $this->neighborhoodService
            ->update(
                $neighborhood,
                $request->validated(),
            );

        return to_route(
            'admin.neighborhoods.index',
        )->with(
            'success',
            'محله با موفقیت ویرایش شد.',
        );
    }

    public function destroy(
        Neighborhood $neighborhood,
    ): RedirectResponse {
        $deleted =
            $this->neighborhoodService
                ->delete(
                    $neighborhood,
                );

        if (!$deleted) {
            return back()->with(
                'error',
                'این محله دارای تعمیرگاه است و تا زمان حذف یا انتقال تعمیرگاه‌ها قابل حذف نیست.',
            );
        }

        return to_route(
            'admin.neighborhoods.index',
        )->with(
            'success',
            'محله با موفقیت حذف شد.',
        );
    }

    private function provinceOptions(): array
    {
        return Province::query()
            ->select([
                'id',
                'name',

                'latitude',
                'longitude',
                'map_zoom',

                'is_active',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (
                    Province $province,
                ): array => [
                    'id' =>
                        $province->id,

                    'name' =>
                        $province->name,

                    'latitude' =>
                        $province->latitude,

                    'longitude' =>
                        $province->longitude,

                    'map_zoom' =>
                        $province->map_zoom,

                    'is_active' =>
                        $province->is_active,
                ],
            )
            ->values()
            ->all();
    }

    private function cityOptions(
        int $provinceId,
    ): array {
        return City::query()
            ->select([
                'id',
                'province_id',
                'name',

                'latitude',
                'longitude',
                'map_zoom',

                'is_active',
            ])
            ->where(
                'province_id',
                $provinceId,
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (City $city): array => [
                    'id' =>
                        $city->id,

                    'province_id' =>
                        $city->province_id,

                    'name' =>
                        $city->name,

                    'latitude' =>
                        $city->latitude,

                    'longitude' =>
                        $city->longitude,

                    'map_zoom' =>
                        $city->map_zoom,

                    'is_active' =>
                        $city->is_active,
                ],
            )
            ->values()
            ->all();
    }
}
