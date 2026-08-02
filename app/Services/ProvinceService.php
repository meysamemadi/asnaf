<?php

namespace App\Services;

use App\Models\Province;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProvinceService
{
    public function create(
        array $data,
    ): Province {
        return DB::transaction(
            function () use ($data): Province {
                $data = $this->normalizeData(
                    $data,
                );

                $data['slug'] =
                    $this->generateUniqueSlug(
                        value: filled(
                            $data['slug'] ?? null,
                        )
                            ? $data['slug']
                            : $data['name'],
                    );

                return Province::query()
                    ->create($data);
            },
        );
    }

    public function update(
        Province $province,
        array $data,
    ): Province {
        return DB::transaction(
            function () use (
                $province,
                $data,
            ): Province {
                $data = $this->normalizeData(
                    $data,
                );

                $data['slug'] =
                    $this->generateUniqueSlug(
                        value: filled(
                            $data['slug'] ?? null,
                        )
                            ? $data['slug']
                            : $data['name'],

                        ignoreId: $province->id,
                    );

                $province->update($data);

                return $province->refresh();
            },
        );
    }

    public function delete(
        Province $province,
    ): bool {
        /*
         * استان دارای شهر نباید حذف شود،
         * چون شهرها و تعمیرگاه‌ها به آن وابسته‌اند.
         */
        if (
            $province->cities()
                ->exists()
        ) {
            return false;
        }

        return (bool) $province->delete();
    }

    private function normalizeData(
        array $data,
    ): array {
        return [
            'name' => trim(
                $data['name'],
            ),

            'slug' => $data['slug'] ?? null,

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
                (int) ($data['map_zoom'] ?? 8),

            'sort_order' =>
                (int) ($data['sort_order'] ?? 0),

            'is_active' =>
                (bool) ($data['is_active'] ?? true),
        ];
    }

    private function generateUniqueSlug(
        string $value,
        ?int $ignoreId = null,
    ): string {
        $baseSlug = Str::slug($value);

        if ($baseSlug === '') {
            $baseSlug =
                'province-' .
                Str::lower(
                    Str::random(8),
                );
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
        Province::query()
            ->where('slug', $slug)
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
