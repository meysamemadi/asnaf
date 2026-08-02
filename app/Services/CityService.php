<?php

namespace App\Services;

use App\Models\City;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CityService
{
    public function create(
        array $data,
    ): City {
        return DB::transaction(
            function () use ($data): City {
                $data = $this->normalizeData(
                    $data,
                );

                $data['slug'] =
                    $this->generateUniqueSlug(
                        provinceId:
                        $data['province_id'],

                        value:
                        $this->slugSource(
                            $data,
                        ),
                    );

                return City::query()
                    ->create($data);
            },
        );
    }

    public function update(
        City $city,
        array $data,
    ): City {
        return DB::transaction(
            function () use (
                $city,
                $data,
            ): City {
                $data = $this->normalizeData(
                    $data,
                );

                $data['slug'] =
                    $this->generateUniqueSlug(
                        provinceId:
                        $data['province_id'],

                        value:
                        $this->slugSource(
                            $data,
                        ),

                        ignoreId: $city->id,
                    );

                $city->update($data);

                return $city->refresh();
            },
        );
    }

    public function delete(
        City $city,
    ): bool {
        return DB::transaction(
            function () use ($city): bool {
                /*
                 * شهر وابسته به محله یا تعمیرگاه
                 * نباید حذف شود.
                 */
                if (
                    $city->neighborhoods()
                        ->exists() ||
                    $city->repairShops()
                        ->exists()
                ) {
                    return false;
                }

                return (bool) $city->delete();
            },
        );
    }

    private function normalizeData(
        array $data,
    ): array {
        return [
            'province_id' =>
                (int) $data['province_id'],

            'name' => trim(
                $data['name'],
            ),

            'slug' => filled(
                $data['slug'] ?? null,
            )
                ? trim($data['slug'])
                : null,

            'code' => filled(
                $data['code'] ?? null,
            )
                ? trim($data['code'])
                : null,

            'latitude' =>
                $data['latitude'] ?? null,

            'longitude' =>
                $data['longitude'] ?? null,

            'map_zoom' =>
                (int) (
                    $data['map_zoom'] ?? 12
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

        if (filled($data['code'] ?? null)) {
            return 'city-' . $data['code'];
        }

        return $data['name'];
    }

    private function generateUniqueSlug(
        int $provinceId,
        string $value,
        ?int $ignoreId = null,
    ): string {
        $baseSlug = Str::slug($value);

        /*
         * نام فارسی ممکن است slug انگلیسی
         * قابل استفاده تولید نکند.
         */
        if ($baseSlug === '') {
            $baseSlug =
                'city-' .
                Str::lower(
                    Str::random(8),
                );
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
        City::query()
            ->where(
                'province_id',
                $provinceId,
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
