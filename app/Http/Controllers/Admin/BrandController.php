<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function __construct(
        private readonly BrandService $brandService,
    ) {
    }

    public function index(Request $request): Response
    {
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

        $search = trim($filters['search'] ?? '');
        $status = $filters['status'] ?? 'all';

        $brands = Brand::query()
            ->select([
                'id',
                'name',
                'slug',
                'logo_path',
                'website',
                'sort_order',
                'is_active',
                'created_at',
            ])
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($query) use ($search): void {
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
                                    'description',
                                    'like',
                                    "%{$search}%",
                                );
                        },
                    );
                },
            )
            ->when(
                $status === 'active',
                fn ($query) => $query->where(
                    'is_active',
                    true,
                ),
            )
            ->when(
                $status === 'inactive',
                fn ($query) => $query->where(
                    'is_active',
                    false,
                ),
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(
                fn (Brand $brand): array => [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,

                    'logo_path' => $brand->logo_path,

                    'logo_url' => $brand->logo_path
                        ? Storage::disk('public')->url(
                            $brand->logo_path,
                        )
                        : null,

                    'website' => $brand->website,
                    'sort_order' => $brand->sort_order,
                    'is_active' => $brand->is_active,

                    'created_at' => $brand->created_at
                        ?->toISOString(),
                ],
            );

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,

            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render(
            'admin/brands/create',
        );
    }

    public function store(
        StoreBrandRequest $request,
    ): RedirectResponse {
        $this->brandService->create(
            $request->validated(),
        );

        return to_route('admin.brands.index')
            ->with(
                'success',
                'برند با موفقیت ایجاد شد.',
            );
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/edit', [
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,

                'logo_path' => $brand->logo_path,

                'logo_url' => $brand->logo_path
                    ? Storage::disk('public')->url(
                        $brand->logo_path,
                    )
                    : null,

                'description' => $brand->description,
                'website' => $brand->website,
                'sort_order' => $brand->sort_order,
                'is_active' => $brand->is_active,
            ],
        ]);
    }

    public function update(
        UpdateBrandRequest $request,
        Brand $brand,
    ): RedirectResponse {
        $this->brandService->update(
            $brand,
            $request->validated(),
        );

        return to_route('admin.brands.index')
            ->with(
                'success',
                'برند با موفقیت ویرایش شد.',
            );
    }

    public function destroy(
        Brand $brand,
    ): RedirectResponse {
        $this->brandService->delete($brand);

        return to_route('admin.brands.index')
            ->with(
                'success',
                'برند با موفقیت حذف شد.',
            );
    }
}
