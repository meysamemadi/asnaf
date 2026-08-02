<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCityRequest;
use App\Http\Requests\Admin\UpdateCityRequest;
use App\Models\City;
use App\Models\Province;
use App\Services\CityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
{
    public function __construct(
        private readonly CityService $cityService,
    ) {
    }

    public function index(
        Request $request,
    ): Response {
        $filters = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:100',
            ],

            'province_id' => [
                'nullable',
                'integer',
                'exists:provinces,id',
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

        $status =
            $filters['status'] ?? 'all';

        $cities = City::query()
            ->select([
                'id',
                'province_id',
                'name',
                'slug',
                'code',

                'latitude',
                'longitude',
                'map_zoom',

                'sort_order',
                'is_active',
                'created_at',
            ])
            ->with([
                'province:id,name,is_active',
            ])
            ->withCount([
                'neighborhoods',
                'repairShops',
            ])
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
                                )
                                ->orWhere(
                                    'code',
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
                $query->where(
                    'province_id',
                    $provinceId,
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
            ->orderBy('province_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(
                fn (City $city): array => [
                    'id' => $city->id,

                    'province_id' =>
                        $city->province_id,

                    'province' =>
                        $city->province
                            ? [
                            'id' =>
                                $city->province->id,

                            'name' =>
                                $city->province->name,

                            'is_active' =>
                                $city->province->is_active,
                        ]
                            : null,

                    'name' => $city->name,
                    'slug' => $city->slug,
                    'code' => $city->code,

                    'latitude' =>
                        $city->latitude,

                    'longitude' =>
                        $city->longitude,

                    'map_zoom' =>
                        $city->map_zoom,

                    'sort_order' =>
                        $city->sort_order,

                    'is_active' =>
                        $city->is_active,

                    'neighborhoods_count' =>
                        $city->neighborhoods_count,

                    'repair_shops_count' =>
                        $city->repair_shops_count,

                    'created_at' =>
                        $city->created_at
                            ?->toISOString(),
                ],
            );

        return Inertia::render(
            'admin/cities/index',
            [
                'cities' => $cities,

                'filters' => [
                    'search' => $search,

                    'province_id' =>
                        $provinceId,

                    'status' => $status,
                ],

                'provinces' =>
                    $this->provinceOptions(),
            ],
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'admin/cities/create',
            [
                'provinces' =>
                    $this->provinceOptions(),
            ],
        );
    }

    public function store(
        StoreCityRequest $request,
    ): RedirectResponse {
        $this->cityService->create(
            $request->validated(),
        );

        return to_route(
            'admin.cities.index',
        )->with(
            'success',
            'شهر با موفقیت ایجاد شد.',
        );
    }

    public function edit(
        City $city,
    ): Response {
        return Inertia::render(
            'admin/cities/edit',
            [
                'city' => [
                    'id' => $city->id,

                    'province_id' =>
                        $city->province_id,

                    'name' => $city->name,
                    'slug' => $city->slug,
                    'code' => $city->code,

                    'latitude' =>
                        $city->latitude,

                    'longitude' =>
                        $city->longitude,

                    'map_zoom' =>
                        $city->map_zoom,

                    'sort_order' =>
                        $city->sort_order,

                    'is_active' =>
                        $city->is_active,
                ],

                'provinces' =>
                    $this->provinceOptions(),
            ],
        );
    }

    public function update(
        UpdateCityRequest $request,
        City $city,
    ): RedirectResponse {
        $this->cityService->update(
            $city,
            $request->validated(),
        );

        return to_route(
            'admin.cities.index',
        )->with(
            'success',
            'شهر با موفقیت ویرایش شد.',
        );
    }

    public function destroy(
        City $city,
    ): RedirectResponse {
        $deleted =
            $this->cityService->delete(
                $city,
            );

        if (!$deleted) {
            return back()->with(
                'error',
                'این شهر دارای محله یا تعمیرگاه است و تا زمان حذف یا انتقال وابستگی‌ها قابل حذف نیست.',
            );
        }

        return to_route(
            'admin.cities.index',
        )->with(
            'success',
            'شهر با موفقیت حذف شد.',
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
                    'id' => $province->id,
                    'name' => $province->name,

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
}
