<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService
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
        ]);

        $search = trim($filters['search'] ?? '');

        $categories = Category::query()
            ->with([
                'parent:id,name',
            ])
            ->withCount('children')
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhereHas(
                                'parent',
                                fn ($query) => $query->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                            );
                    });
                }
            )
            ->orderByRaw('parent_id IS NOT NULL')
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,

            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create', [
            'parentOptions' => $this->categoryService
                ->getParentOptions(),
        ]);
    }

    public function store(
        StoreCategoryRequest $request
    ): RedirectResponse {
        $this->categoryService->create(
            $request->validated()
        );

        return to_route('admin.categories.index')
            ->with(
                'success',
                'دسته‌بندی با موفقیت ایجاد شد.'
            );
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => [
                'id' => $category->id,
                'parent_id' => $category->parent_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'icon' => $category->icon,
                'icon_library' => $category->icon_library,
                'description' => $category->description,
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
            ],

            'parentOptions' => $this->categoryService
                ->getParentOptions($category),

            'icons' => config('category-icons'),
        ]);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category
    ): RedirectResponse {
        $this->categoryService->update(
            $category,
            $request->validated()
        );

        return to_route('admin.categories.index')
            ->with(
                'success',
                'دسته‌بندی با موفقیت ویرایش شد.'
            );
    }

    public function destroy(
        Category $category
    ): RedirectResponse {
        $this->categoryService->delete($category);

        return to_route('admin.categories.index')
            ->with(
                'success',
                'دسته‌بندی با موفقیت حذف شد.'
            );
    }
}
