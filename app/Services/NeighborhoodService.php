<?php

namespace App\Services;

use App\Models\Neighborhood;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NeighborhoodService
{
    public function create(
        array $data,
    ): Neighborhood {
        return DB::transaction(
            function () use ($data): Neighborhood {
                $data = $this->normalizeData(
                    $data,
                );

                $data['slug'] =
                    $this->generateUniqueSlug(
                        cityId:
                        $data['city_id'],

                        value:
                        $this->slugSource(
                            $data,
                        ),
                    );

                return Neighborhood::query()
                    ->create($data);
            },
        );
    }

    public function update(
        Neighborhood $neighborhood,
        array $data,
    ): Neighborhood {
        return DB::transaction(
            function () use (
                $neighborhood,
                $data,
            ): Neighborhood {
                $data = $this->normalizeData(
                    $data,
                );

                $data['slug'] =
                    $this->generateUniqueSlug(
                        cityId:
                        $data['city_id'],

                        value:
                        $this->slugSource(
                            $data,
                        ),

                        ignoreId:
                        $neighborhood->id,
                    );

                $neighborhood->update(
                    $data,
                );

                return $neighborhood
                    ->refresh();
            },
        );
    }

    public function delete(
        Neighborhood $neighborhood,
    ): bool {
        return DB::transaction(
            function () use (
                $neighborhood,
            ): bool {
                /*
                 * محله‌ای که تعمیرگاه به آن متصل
                 * است نباید حذف شود.
                 */
                if (
                    $neighborhood
                        ->repairShops()
                        ->exists()
                ) {
                    return false;
                }

                return (bool) $neighborhood
                    ->delete();
            },
        );
    }

    private function normalizeData(
        array $data,
    ): array {
        return [
            /*
             * province_id عمداً ذخیره نمی‌شود؛
             * استان از طریق city قابل دسترسی است.
             */
            'city_id' =>
                (int) $data['city_id'],

            'name' => trim(
                $data['name'],
            ),

            'slug' => filled(
                $data['slug'] ?? null,
            )
                ? trim($data['slug'])
                : null,

            'latitude' =>
                $data['latitude'] ?? null,

            'longitude' =>
                $data['longitude'] ?? null,

            'map_zoom' =>
                (int) (
                    $data['map_zoom'] ?? 15
                ),

            'sort_order' =>
                (int) (
                    $data['sort_order'] ?? 0
                ),

            'is_active' =>
                (bool) (
                    $data['is_active'] ?? true
                ),
        ];
    }

    private function slugSource(
        array $data,
    ): string {
        if (filled($data['slug'] ?? null)) {
            return $data['slug'];
        }

        return $data['name'];
    }

    private function generateUniqueSlug(
        int $cityId,
        string $value,
        ?int $ignoreId = null,
    ): string {
        $baseSlug = Str::slug($value);

        /*
         * نام فارسی ممکن است توسط Str::slug
         * به رشته خالی تبدیل شود.
         */
        if ($baseSlug === '') {
            $baseSlug =
                'neighborhood-' .
                Str::lower(
                    Str::random(8),
                );
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
        Neighborhood::query()
            ->where(
                'city_id',
                $cityId,
            )
            ->where(
                'slug',
                $slug,
            )
            ->when(
                $ignoreId !== null,
                fn ($query) =>
                $query->whereKeyNot(
                    $ignoreId,
                ),
            )
            ->exists()
        ) {
            $slug =
                "{$baseSlug}-{$counter}";

            $counter++;
        }

        return $slug;
    }
}
