<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProvinceRequest;
use App\Http\Requests\Admin\UpdateProvinceRequest;
use App\Models\Province;
use App\Services\ProvinceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProvinceController extends Controller
{
    public function __construct(
        private readonly ProvinceService $provinceService,
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

            'status' => [
                'nullable',
                'in:all,active,inactive',
            ],
        ]);

        $search = trim(
            $filters['search'] ?? '',
        );

        $status =
            $filters['status'] ?? 'all';

        $provinces = Province::query()
            ->select([
                'id',
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
            ->withCount('cities')
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
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(
                fn (
                    Province $province,
                ): array => [
                    'id' => $province->id,
                    'name' => $province->name,
                    'slug' => $province->slug,
                    'code' => $province->code,

                    'latitude' =>
                        $province->latitude,

                    'longitude' =>
                        $province->longitude,

                    'map_zoom' =>
                        $province->map_zoom,

                    'sort_order' =>
                        $province->sort_order,

                    'is_active' =>
                        $province->is_active,

                    'cities_count' =>
                        $province->cities_count,

                    'created_at' =>
                        $province->created_at
                            ?->toISOString(),
                ],
            );

        return Inertia::render(
            'admin/provinces/index',
            [
                'provinces' =>
                    $provinces,

                'filters' => [
                    'search' => $search,
                    'status' => $status,
                ],
            ],
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'admin/provinces/create',
        );
    }

    public function store(
        StoreProvinceRequest $request,
    ): RedirectResponse {
        $this->provinceService->create(
            $request->validated(),
        );

        return to_route(
            'admin.provinces.index',
        )->with(
            'success',
            'استان با موفقیت ایجاد شد.',
        );
    }

    public function edit(
        Province $province,
    ): Response {
        return Inertia::render(
            'admin/provinces/edit',
            [
                'province' => [
                    'id' => $province->id,
                    'name' => $province->name,
                    'slug' => $province->slug,
                    'code' => $province->code,

                    'latitude' =>
                        $province->latitude,

                    'longitude' =>
                        $province->longitude,

                    'map_zoom' =>
                        $province->map_zoom,

                    'sort_order' =>
                        $province->sort_order,

                    'is_active' =>
                        $province->is_active,
                ],
            ],
        );
    }

    public function update(
        UpdateProvinceRequest $request,
        Province $province,
    ): RedirectResponse {
        $this->provinceService->update(
            $province,
            $request->validated(),
        );

        return to_route(
            'admin.provinces.index',
        )->with(
            'success',
            'استان با موفقیت ویرایش شد.',
        );
    }

    public function destroy(
        Province $province,
    ): RedirectResponse {
        $deleted =
            $this->provinceService->delete(
                $province,
            );

        if (!$deleted) {
            return back()->with(
                'error',
                'این استان دارای شهر است و تا زمانی که شهرهای آن حذف یا منتقل نشوند قابل حذف نیست.',
            );
        }

        return to_route(
            'admin.provinces.index',
        )->with(
            'success',
            'استان با موفقیت حذف شد.',
        );
    }
}
