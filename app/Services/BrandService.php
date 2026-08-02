<?php

namespace App\Services;

use App\Models\Brand;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;


/**
 * ایجاد slug یکتا
 * ذخیره لوگو
 * جایگزینی لوگوی قبلی
 * حذف اختیاری لوگو
 * جلوگیری از باقی‌ماندن فایل ناقص هنگام خطای دیتابیس
 * Soft Delete برند
 */

class BrandService
{
    public function create(array $data): Brand
    {
        /** @var UploadedFile|null $logo */
        $logo = $data['logo'] ?? null;

        unset($data['logo']);

        $logoPath = $logo?->store(
            path: 'brands/logos',
            options: 'public',
        );

        try {
            return DB::transaction(
                function () use ($data, $logoPath): Brand {
                    $data['slug'] = $this->generateUniqueSlug(
                        $data['slug'] ?: $data['name'],
                    );

                    $data['logo_path'] = $logoPath;
                    $data['sort_order'] ??= 0;
                    $data['is_active'] ??= true;

                    return Brand::query()->create($data);
                },
            );
        } catch (Throwable $exception) {
            if ($logoPath) {
                Storage::disk('public')->delete($logoPath);
            }

            throw $exception;
        }
    }

    public function update(
        Brand $brand,
        array $data,
    ): Brand {
        /** @var UploadedFile|null $newLogo */
        $newLogo = $data['logo'] ?? null;

        $removeLogo = (bool) ($data['remove_logo'] ?? false);
        $oldLogoPath = $brand->logo_path;

        unset(
            $data['logo'],
            $data['remove_logo'],
        );

        $newLogoPath = $newLogo?->store(
            path: 'brands/logos',
            options: 'public',
        );

        try {
            $updatedBrand = DB::transaction(
                function () use (
                    $brand,
                    $data,
                    $newLogoPath,
                    $removeLogo,
                ): Brand {
                    $data['slug'] = $this->generateUniqueSlug(
                        value: $data['slug'] ?: $data['name'],
                        ignoreId: $brand->id,
                    );

                    if ($newLogoPath) {
                        $data['logo_path'] = $newLogoPath;
                    } elseif ($removeLogo) {
                        $data['logo_path'] = null;
                    }

                    $data['sort_order'] ??= 0;

                    $brand->update($data);

                    return $brand->refresh();
                },
            );
        } catch (Throwable $exception) {
            if ($newLogoPath) {
                Storage::disk('public')->delete($newLogoPath);
            }

            throw $exception;
        }

        if (
            $oldLogoPath &&
            ($newLogoPath || $removeLogo)
        ) {
            Storage::disk('public')->delete($oldLogoPath);
        }

        return $updatedBrand;
    }

    public function delete(Brand $brand): void
    {
        /*
         * برند Soft Delete می‌شود؛ لوگو را حذف نمی‌کنیم
         * تا در آینده امکان بازیابی برند وجود داشته باشد.
         */
        $brand->delete();
    }

    private function generateUniqueSlug(
        string $value,
        ?int $ignoreId = null,
    ): string {
        $baseSlug = Str::slug($value);

        if ($baseSlug === '') {
            $baseSlug = 'brand-' . Str::lower(
                    Str::random(8),
                );
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
        Brand::query()
            ->withTrashed()
            ->where('slug', $slug)
            ->when(
                $ignoreId !== null,
                fn ($query) => $query->whereKeyNot(
                    $ignoreId,
                ),
            )
            ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
