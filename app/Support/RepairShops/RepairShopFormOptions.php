<?php

namespace App\Support\RepairShops;

use App\Enums\AgencyStatus;
use App\Enums\BusinessLicenseStatus;
use App\Enums\RepairShopApprovalStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Province;

final class RepairShopFormOptions
{
    /**
     * گزینه‌های مشترک فرم ایجاد و ویرایش.
     *
     * @return array<string, mixed>
     */
    public function form(): array
    {
        return [
            'categories' => $this->categories(),
            'brands' => $this->brands(),
            'provinces' => $this->provinces(),

            'approval_statuses' =>
                RepairShopApprovalStatus::options(),

            'business_license_statuses' =>
                BusinessLicenseStatus::options(),

            'agency_statuses' =>
                AgencyStatus::options(),
        ];
    }

    /**
     * گزینه‌های صفحه فهرست.
     *
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return [
            'categories' => $this->categories(),

            'cities' => City::query()
                ->select([
                    'id',
                    'province_id',
                    'name',
                ])
                ->with('province:id,name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(
                    fn (City $city): array => [
                        'id' => $city->id,
                        'province_id' => $city->province_id,
                        'name' => $city->name,

                        'label' => $city->province
                            ? $city->province->name
                            . ' / '
                            . $city->name
                            : $city->name,
                    ],
                )
                ->values()
                ->all(),

            'approval_statuses' =>
                RepairShopApprovalStatus::options(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function citiesForProvince(
        int $provinceId,
    ): array {
        return City::query()
            ->select([
                'id',
                'province_id',
                'name',
            ])
            ->where('province_id', $provinceId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (City $city): array => [
                    'id' => $city->id,
                    'province_id' => $city->province_id,
                    'name' => $city->name,
                ],
            )
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function neighborhoodsForCity(
        int $cityId,
    ): array {
        return Neighborhood::query()
            ->select([
                'id',
                'city_id',
                'name',
            ])
            ->where('city_id', $cityId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (Neighborhood $neighborhood): array => [
                    'id' => $neighborhood->id,
                    'city_id' => $neighborhood->city_id,
                    'name' => $neighborhood->name,

                    'latitude' => $neighborhood->latitude,
                    'longitude' => $neighborhood->longitude,
                    'map_zoom' => $neighborhood->map_zoom,
                ],
            )
            ->all();
    }

    /**
     * فقط دسته‌بندی‌های نهایی قابل انتخاب هستند.
     *
     * @return array<int, array<string, mixed>>
     */
    private function categories(): array
    {
        return Category::query()
            ->select([
                'id',
                'parent_id',
                'name',
            ])
            ->with('parent:id,name')
            ->where('is_active', true)
            ->whereDoesntHave('children')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (Category $category): array => [
                    'id' => $category->id,
                    'parent_id' => $category->parent_id,
                    'name' => $category->name,

                    'label' => $category->parent
                        ? $category->parent->name
                        . ' / '
                        . $category->name
                        : $category->name,
                ],
            )
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function brands(): array
    {
        return Brand::query()
            ->select([
                'id',
                'name',
            ])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (Brand $brand): array => [
                    'id' => $brand->id,
                    'name' => $brand->name,


                ],
            )
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function provinces(): array
    {
        return Province::query()
            ->select([
                'id',
                'name',
            ])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (Province $province): array => [
                    'id' => $province->id,
                    'name' => $province->name,

                    'latitude' => $province->latitude,
                    'longitude' => $province->longitude,
                    'map_zoom' => $province->map_zoom,
                ],
            )
            ->all();
    }
}
