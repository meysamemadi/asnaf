<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * دریافت درخت دسته‌بندی‌های فعال
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->root()
            ->active()
            ->with(
                'activeChildrenRecursive',
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection(
            $categories,
        );
    }

    /**
     * دریافت اطلاعات یک دسته‌بندی
     */
    public function show(
        Category $category,
    ): CategoryResource {
        abort_unless(
            $category->is_active,
            404,
        );

        $category->load([
            'parent',

            'activeChildrenRecursive',
        ]);

        return CategoryResource::make(
            $category,
        );
    }
}
