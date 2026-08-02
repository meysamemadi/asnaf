<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    public function create(array $data): Category
    {
        return DB::transaction(function () use ($data): Category {
            $data['slug'] = $this->generateUniqueSlug(
                $data['slug'] ?: $data['name']
            );

            $data['sort_order'] ??= 0;
            $data['is_active'] ??= true;

            return Category::create($data);
        });
    }

    public function update(Category $category, array $data): Category
    {
        return DB::transaction(function () use ($category, $data): Category {
            if (array_key_exists('parent_id', $data)) {
                $this->ensureValidParent(
                    category: $category,
                    parentId: $data['parent_id'],
                );
            }

            $slugSource = $data['slug'] ?: $data['name'];

            $data['slug'] = $this->generateUniqueSlug(
                value: $slugSource,
                ignoreId: $category->id,
            );

            $data['sort_order'] ??= 0;

            $category->update($data);

            return $category->refresh();
        });
    }

    public function delete(Category $category): void
    {
        if ($category->children()->exists()) {
            throw ValidationException::withMessages([
                'category' => [
                    'این دسته‌بندی زیرمجموعه دارد. ابتدا زیرمجموعه‌ها را حذف یا منتقل کنید.',
                ],
            ]);
        }

        $category->delete();
    }

    public function getParentOptions(
        ?Category $excludedCategory = null
    ): array {
        $query = Category::query()
            ->orderBy('name');

        if ($excludedCategory) {
            $excludedIds = [
                $excludedCategory->id,
                ...$this->descendantIds($excludedCategory),
            ];

            $query->whereNotIn('id', $excludedIds);
        }

        return $query
            ->get(['id', 'parent_id', 'name'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'parent_id' => $category->parent_id,
                'name' => $category->name,
            ])
            ->all();
    }

    public function descendantIds(Category $category): array
    {
        $descendantIds = [];
        $parentIds = [$category->id];

        while ($parentIds !== []) {
            $childIds = Category::query()
                ->whereIn('parent_id', $parentIds)
                ->pluck('id')
                ->all();

            if ($childIds === []) {
                break;
            }

            $descendantIds = [
                ...$descendantIds,
                ...$childIds,
            ];

            $parentIds = $childIds;
        }

        return $descendantIds;
    }

    private function ensureValidParent(
        Category $category,
        mixed $parentId
    ): void {
        if ($parentId === null || $parentId === '') {
            return;
        }

        $parentId = (int) $parentId;

        if ($parentId === $category->id) {
            throw ValidationException::withMessages([
                'parent_id' => [
                    'یک دسته‌بندی نمی‌تواند والد خودش باشد.',
                ],
            ]);
        }

        $descendantIds = $this->descendantIds($category);

        if (in_array($parentId, $descendantIds, true)) {
            throw ValidationException::withMessages([
                'parent_id' => [
                    'نمی‌توانید یکی از زیرمجموعه‌های این دسته را به‌عنوان والد انتخاب کنید.',
                ],
            ]);
        }
    }

    private function generateUniqueSlug(
        string $value,
        ?int $ignoreId = null
    ): string {
        $baseSlug = Str::slug($value);

        if ($baseSlug === '') {
            $baseSlug = Str::lower(Str::random(10));
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
        Category::query()
            ->where('slug', $slug)
            ->when(
                $ignoreId !== null,
                fn ($query) => $query->whereKeyNot($ignoreId)
            )
            ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
