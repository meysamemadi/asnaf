<?php

namespace App\Services;

use App\Models\RepairShop;
use App\Models\RepairShopAgency;
use App\Models\RepairShopServiceArea;
use App\Support\GeoJson\MultiPolygonGeoJson;
use Illuminate\Contracts\Database\Query\Expression;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class RepairShopService
{
    public function create(array $data): RepairShop
    {
        $createdFilePaths = [];

        try {
            $imagePaths = $this->storeIncomingImages(
                $data,
                $createdFilePaths,
            );

            $agencies = $this->storeIncomingAgencyFiles(
                $data['agencies'] ?? [],
                $createdFilePaths,
            );

            $categoryIds = $data['category_ids'] ?? [];
            $serviceAreas = $data['service_areas'] ?? [];

            $repairShop = DB::transaction(
                function () use (
                    $data,
                    $imagePaths,
                    $agencies,
                    $categoryIds,
                    $serviceAreas,
                ): RepairShop {
                    $attributes =
                        $this->repairShopAttributes($data);

                    $attributes['slug'] =
                        $this->generateUniqueSlug(
                            $data['slug'] ?: $data['name'],
                        );

                    $attributes['location'] =
                        $this->pointExpression(
                            longitude: (float) $data['longitude'],
                            latitude: (float) $data['latitude'],
                        );

                    $attributes = array_merge(
                        $attributes,
                        $imagePaths,
                    );

                    $repairShop =
                        RepairShop::query()->create(
                            $attributes,
                        );

                    $this->syncCategories(
                        $repairShop,
                        $categoryIds,
                    );

                    $this->syncAgenciesForCreate(
                        $repairShop,
                        $agencies,
                    );

                    $this->syncServiceAreas(
                        $repairShop,
                        $serviceAreas,
                    );

                    return $repairShop;
                },
            );

            return $this->freshRepairShop(
                $repairShop,
            );
        } catch (Throwable $exception) {
            $this->deleteFiles($createdFilePaths);

            throw $exception;
        }
    }

    public function update(
        RepairShop $repairShop,
        array $data,
    ): RepairShop {
        $createdFilePaths = [];
        $oldFilePathsToDelete = [];

        try {
            $newImagePaths =
                $this->storeIncomingImages(
                    $data,
                    $createdFilePaths,
                );

            $agencies =
                $this->storeIncomingAgencyFiles(
                    $data['agencies'] ?? [],
                    $createdFilePaths,
                );

            $categoryIds = $data['category_ids'] ?? [];
            $serviceAreas = $data['service_areas'] ?? [];

            DB::transaction(
                function () use (
                    $repairShop,
                    $data,
                    $newImagePaths,
                    $agencies,
                    $categoryIds,
                    $serviceAreas,
                    &$oldFilePathsToDelete,
                ): void {
                    $attributes =
                        $this->repairShopAttributes($data);

                    $attributes['slug'] =
                        $this->generateUniqueSlug(
                            value: $data['slug'] ?: $data['name'],
                            ignoreId: $repairShop->id,
                        );

                    $attributes['location'] =
                        $this->pointExpression(
                            longitude: (float) $data['longitude'],
                            latitude: (float) $data['latitude'],
                        );

                    $this->applyImageUpdates(
                        repairShop: $repairShop,
                        attributes: $attributes,
                        data: $data,
                        newImagePaths: $newImagePaths,
                        oldPathsToDelete:
                        $oldFilePathsToDelete,
                    );

                    $repairShop->update($attributes);

                    $this->syncCategories(
                        $repairShop,
                        $categoryIds,
                    );

                    $this->syncAgenciesForUpdate(
                        repairShop: $repairShop,
                        agencies: $agencies,
                        oldPathsToDelete:
                        $oldFilePathsToDelete,
                    );

                    $this->syncServiceAreas(
                        $repairShop,
                        $serviceAreas,
                    );
                },
            );

            /*
             * فایل قبلی تنها پس از موفقیت کامل دیتابیس
             * حذف می‌شود.
             */
            $this->deleteFiles(
                $oldFilePathsToDelete,
            );

            return $this->freshRepairShop(
                $repairShop,
            );
        } catch (Throwable $exception) {
            /*
             * فایل‌هایی که برای درخواست جدید ذخیره شده‌اند
             * در صورت Rollback پاک می‌شوند.
             */
            $this->deleteFiles($createdFilePaths);

            throw $exception;
        }
    }

    public function delete(
        RepairShop $repairShop,
    ): void {
        /*
         * RepairShop از SoftDeletes استفاده می‌کند؛
         * فایل‌ها و روابط فعلاً حفظ می‌شوند.
         */
        $repairShop->delete();
    }

    /**
     * @return array<string, mixed>
     */
    private function repairShopAttributes(
        array $data,
    ): array {
        $attributes = Arr::only(
            $data,
            [
                'primary_category_id',
                'city_id',
                'neighborhood_id',

                'name',
                'owner_name',
                'professional_title',
                'short_description',
                'description',

                'mobile',
                'phone',
                'whatsapp',
                'email',
                'website',

                'address',
                'postal_code',

                'union_membership_code',
                'business_license_number',
                'business_license_issued_at',
                'business_license_expires_at',
                'business_license_status',

                'approval_status',
                'rejection_reason',

                'is_union_member',
                'is_verified',
                'is_featured',
                'is_active',

                'sort_order',
                'published_at',
            ],
        );

        foreach (
            [
                'is_union_member',
                'is_verified',
                'is_featured',
                'is_active',
            ] as $booleanField
        ) {
            if (
                array_key_exists(
                    $booleanField,
                    $attributes,
                )
            ) {
                $attributes[$booleanField] =
                    $this->toBoolean(
                        $attributes[$booleanField],
                    );
            }
        }

        $attributes['sort_order'] =
            (int) ($attributes['sort_order'] ?? 0);

        if (
            ($attributes['approval_status'] ?? null)
            !== 'rejected'
        ) {
            $attributes['rejection_reason'] = null;
        }

        return $attributes;
    }

    /**
     * @param array<int, int|string> $categoryIds
     */
    private function syncCategories(
        RepairShop $repairShop,
        array $categoryIds,
    ): void {
        $normalizedIds = collect($categoryIds)
            ->map(fn (mixed $id): int => (int) $id)
            ->unique()
            ->values();

        $primaryCategoryId =
            (int) $repairShop->primary_category_id;

        if (
            !$normalizedIds->contains(
                $primaryCategoryId,
            )
        ) {
            throw ValidationException::withMessages([
                'primary_category_id' =>
                    'تخصص اصلی باید در میان تخصص‌های انتخاب‌شده باشد.',
            ]);
        }

        $syncData = $normalizedIds
            ->mapWithKeys(
                fn (int $categoryId, int $index): array => [
                    $categoryId => [
                        'is_active' => true,
                        'sort_order' => $index,
                    ],
                ],
            )
            ->all();

        $repairShop->categories()->sync(
            $syncData,
        );
    }

    /**
     * @param array<int, array<string, mixed>> $agencies
     */
    private function syncAgenciesForCreate(
        RepairShop $repairShop,
        array $agencies,
    ): void {
        foreach ($agencies as $agency) {
            $repairShop->agencies()->create(
                $this->agencyAttributes(
                    agency: $agency,
                    certificatePath:
                    $agency['_certificate_path'] ?? null,
                ),
            );
        }
    }

    /**
     * @param array<int, array<string, mixed>> $agencies
     * @param array<int, string> $oldPathsToDelete
     */
    private function syncAgenciesForUpdate(
        RepairShop $repairShop,
        array $agencies,
        array &$oldPathsToDelete,
    ): void {
        $existingAgencies = $repairShop
            ->agencies()
            ->get()
            ->keyBy('brand_id');

        $retainedBrandIds = [];

        foreach ($agencies as $agencyData) {
            $brandId = (int) $agencyData['brand_id'];

            /** @var RepairShopAgency|null $agency */
            $agency = $existingAgencies->get(
                $brandId,
            );

            $certificatePath =
                $agency?->certificate_path;

            if (
                isset(
                    $agencyData['_certificate_path'],
                )
            ) {
                if ($certificatePath) {
                    $oldPathsToDelete[] =
                        $certificatePath;
                }

                $certificatePath =
                    $agencyData['_certificate_path'];
            } elseif (
                $this->toBoolean(
                    $agencyData['remove_certificate']
                    ?? false,
                )
            ) {
                if ($certificatePath) {
                    $oldPathsToDelete[] =
                        $certificatePath;
                }

                $certificatePath = null;
            }

            $attributes = $this->agencyAttributes(
                agency: $agencyData,
                certificatePath: $certificatePath,
            );

            if ($agency) {
                $agency->update($attributes);
            } else {
                $repairShop->agencies()->create(
                    $attributes,
                );
            }

            $retainedBrandIds[] = $brandId;
        }

        $removedAgenciesQuery =
            $repairShop->agencies();

        if ($retainedBrandIds !== []) {
            $removedAgenciesQuery->whereNotIn(
                'brand_id',
                $retainedBrandIds,
            );
        }

        $removedAgencies =
            $removedAgenciesQuery->get();

        foreach ($removedAgencies as $removedAgency) {
            if ($removedAgency->certificate_path) {
                $oldPathsToDelete[] =
                    $removedAgency->certificate_path;
            }

            $removedAgency->delete();
        }
    }

    /**
     * @param array<string, mixed> $agency
     *
     * @return array<string, mixed>
     */
    private function agencyAttributes(
        array $agency,
        ?string $certificatePath,
    ): array {
        return [
            'brand_id' => (int) $agency['brand_id'],

            'certificate_number' =>
                $agency['certificate_number'] ?? null,

            'certificate_path' =>
                $certificatePath,

            'issued_at' =>
                $agency['issued_at'] ?? null,

            'expires_at' =>
                $agency['expires_at'] ?? null,

            'status' => $agency['status'],

            'is_official' => $this->toBoolean(
                $agency['is_official'],
            ),

            'notes' => $agency['notes'] ?? null,
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $areas
     */
    private function syncServiceAreas(
        RepairShop $repairShop,
        array $areas,
    ): void {
        $existingAreas = $repairShop
            ->serviceAreas()
            ->get()
            ->keyBy('id');

        $retainedIds = [];

        foreach ($areas as $index => $areaData) {
            $geoJson = MultiPolygonGeoJson::from(
                $areaData['geojson'],
            );

            $wkt = $geoJson->toWkt();

            $this->assertValidMultiPolygon(
                wkt: $wkt,
                field:
                "service_areas.{$index}.geojson",
            );

            $attributes = [
                'name' => $areaData['name'],

                'area' =>
                    $this->spatialExpression(
                        $wkt,
                    ),

                'description' =>
                    $areaData['description'] ?? null,

                'is_active' =>
                    $this->toBoolean(
                        $areaData['is_active'],
                    ),

                'sort_order' =>
                    (int) (
                        $areaData['sort_order']
                        ?? $index
                    ),
            ];

            $areaId = isset($areaData['id'])
                ? (int) $areaData['id']
                : null;

            if ($areaId) {
                /** @var RepairShopServiceArea|null $serviceArea */
                $serviceArea =
                    $existingAreas->get($areaId);

                if (!$serviceArea) {
                    throw ValidationException::withMessages([
                        "service_areas.{$index}.id" =>
                            'محدوده انتخاب‌شده متعلق به این تعمیرگاه نیست.',
                    ]);
                }

                $serviceArea->update(
                    $attributes,
                );

                $retainedIds[] =
                    $serviceArea->id;

                continue;
            }

            $serviceArea =
                $repairShop
                    ->serviceAreas()
                    ->create($attributes);

            $retainedIds[] =
                $serviceArea->id;
        }

        $areasToDelete =
            $repairShop->serviceAreas();

        if ($retainedIds !== []) {
            $areasToDelete->whereNotIn(
                'id',
                $retainedIds,
            );
        }

        $areasToDelete->delete();
    }

    /**
     * @param array<string, mixed> $data
     * @param array<int, string> $createdFilePaths
     *
     * @return array<string, string>
     */
    private function storeIncomingImages(
        array $data,
        array &$createdFilePaths,
    ): array {
        $definitions = [
            'logo' => [
                'column' => 'logo_path',
                'directory' =>
                    'repair-shops/logos',
            ],

            'cover_image' => [
                'column' => 'cover_image_path',
                'directory' =>
                    'repair-shops/covers',
            ],

            'owner_photo' => [
                'column' => 'owner_photo_path',
                'directory' =>
                    'repair-shops/owners',
            ],
        ];

        $stored = [];

        foreach (
            $definitions as $input => $definition
        ) {
            $file = $data[$input] ?? null;

            if (!$file instanceof UploadedFile) {
                continue;
            }

            $path = $this->storeFile(
                file: $file,
                directory: $definition['directory'],
            );

            $stored[$definition['column']] =
                $path;

            $createdFilePaths[] = $path;
        }

        return $stored;
    }

    /**
     * @param array<int, array<string, mixed>> $agencies
     * @param array<int, string> $createdFilePaths
     *
     * @return array<int, array<string, mixed>>
     */
    private function storeIncomingAgencyFiles(
        array $agencies,
        array &$createdFilePaths,
    ): array {
        return array_map(
            function (array $agency) use (
                &$createdFilePaths,
            ): array {
                $certificate =
                    $agency['certificate'] ?? null;

                if (
                    $certificate instanceof
                    UploadedFile
                ) {
                    $path = $this->storeFile(
                        file: $certificate,
                        directory:
                        'repair-shops/agency-certificates',
                    );

                    $agency[
                    '_certificate_path'
                    ] = $path;

                    $createdFilePaths[] = $path;
                }

                unset($agency['certificate']);

                return $agency;
            },
            $agencies,
        );
    }

    /**
     * @param array<string, mixed> $attributes
     * @param array<string, mixed> $data
     * @param array<string, string> $newImagePaths
     * @param array<int, string> $oldPathsToDelete
     */
    private function applyImageUpdates(
        RepairShop $repairShop,
        array &$attributes,
        array $data,
        array $newImagePaths,
        array &$oldPathsToDelete,
    ): void {
        $definitions = [
            'logo_path' => [
                'remove' => 'remove_logo',
            ],

            'cover_image_path' => [
                'remove' => 'remove_cover_image',
            ],

            'owner_photo_path' => [
                'remove' => 'remove_owner_photo',
            ],
        ];

        foreach (
            $definitions as $column => $definition
        ) {
            $oldPath = $repairShop->{$column};

            if (
                array_key_exists(
                    $column,
                    $newImagePaths,
                )
            ) {
                $attributes[$column] =
                    $newImagePaths[$column];

                if ($oldPath) {
                    $oldPathsToDelete[] =
                        $oldPath;
                }

                continue;
            }

            if (
                $this->toBoolean(
                    $data[$definition['remove']]
                    ?? false,
                )
            ) {
                $attributes[$column] = null;

                if ($oldPath) {
                    $oldPathsToDelete[] =
                        $oldPath;
                }
            }
        }
    }

    private function pointExpression(
        float $longitude,
        float $latitude,
    ): Expression {
        $wkt = sprintf(
            'POINT(%s %s)',
            $this->formatCoordinate($longitude),
            $this->formatCoordinate($latitude),
        );

        return $this->spatialExpression($wkt);
    }

    private function spatialExpression(
        string $wkt,
    ): Expression {
        $quotedWkt = DB::connection()
            ->getPdo()
            ->quote($wkt);

        return DB::raw(
            "ST_GeomFromText("
            . "{$quotedWkt}, "
            . "4326, "
            . "'axis-order=long-lat'"
            . ')',
        );
    }

    private function assertValidMultiPolygon(
        string $wkt,
        string $field,
    ): void {
        $result = DB::selectOne(
            <<<'SQL'
                SELECT ST_IsValid(
                    ST_GeomFromText(
                        ?,
                        4326,
                        'axis-order=long-lat'
                    )
                ) AS is_valid
            SQL,
            [$wkt],
        );

        if (!(bool) ($result->is_valid ?? false)) {
            throw ValidationException::withMessages([
                $field =>
                    'محدوده ترسیم‌شده از نظر هندسی معتبر نیست.',
            ]);
        }
    }

    private function generateUniqueSlug(
        string $value,
        ?int $ignoreId = null,
    ): string {
        $baseSlug = Str::slug($value);

        if ($baseSlug === '') {
            $baseSlug =
                'repair-shop-'
                . Str::lower(Str::random(8));
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
        RepairShop::query()
            ->withTrashed()
            ->where('slug', $slug)
            ->when(
                $ignoreId !== null,
                fn ($query) =>
                $query->where(
                    'id',
                    '!=',
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

    private function storeFile(
        UploadedFile $file,
        string $directory,
    ): string {
        $path = $file->store(
            $directory,
            'public',
        );

        if (!$path) {
            throw new RuntimeException(
                'ذخیره فایل با خطا مواجه شد.',
            );
        }

        return $path;
    }

    /**
     * @param array<int, string|null> $paths
     */
    private function deleteFiles(
        array $paths,
    ): void {
        $paths = array_values(
            array_unique(
                array_filter($paths),
            ),
        );

        if ($paths === []) {
            return;
        }

        Storage::disk('public')->delete(
            $paths,
        );
    }

    private function formatCoordinate(
        float $value,
    ): string {
        return rtrim(
            rtrim(
                number_format(
                    $value,
                    8,
                    '.',
                    '',
                ),
                '0',
            ),
            '.',
        );
    }

    private function toBoolean(
        mixed $value,
    ): bool {
        return filter_var(
            $value,
            FILTER_VALIDATE_BOOLEAN,
        );
    }

    private function freshRepairShop(
        RepairShop $repairShop,
    ): RepairShop {
        return $repairShop->fresh([
            'city.province',
            'neighborhood',
            'primaryCategory',
            'categories',
            'agencies.brand',
            'serviceAreas',
        ]);
    }
}
