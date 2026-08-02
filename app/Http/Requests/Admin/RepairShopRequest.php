<?php

namespace App\Http\Requests\Admin;

use App\Enums\AgencyStatus;
use App\Enums\BusinessLicenseStatus;
use App\Enums\RepairShopApprovalStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\RepairShop;
use App\Models\RepairShopServiceArea;
use App\Rules\ValidServiceAreaGeoJson;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use Illuminate\Validation\Validator;

abstract class RepairShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    protected function repairShopRules(
        ?RepairShop $repairShop = null,
    ): array {
        $slugUnique = Rule::unique(
            'repair_shops',
            'slug',
        );

        $membershipCodeUnique = Rule::unique(
            'repair_shops',
            'union_membership_code',
        );

        $licenseNumberUnique = Rule::unique(
            'repair_shops',
            'business_license_number',
        );

        if ($repairShop) {
            $this->ignoreRepairShop(
                $slugUnique,
                $repairShop,
            );

            $this->ignoreRepairShop(
                $membershipCodeUnique,
                $repairShop,
            );

            $this->ignoreRepairShop(
                $licenseNumberUnique,
                $repairShop,
            );
        }

        return [
            /*
             * اطلاعات اصلی
             */
            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:190',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                $slugUnique,
            ],

            'owner_name' => [
                'required',
                'string',
                'max:150',
            ],

            'professional_title' => [
                'nullable',
                'string',
                'max:150',
            ],

            'short_description' => [
                'nullable',
                'string',
                'max:500',
            ],

            'description' => [
                'nullable',
                'string',
                'max:20000',
            ],

            /*
             * دسته‌بندی‌ها
             */
            'primary_category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id'),
            ],

            'category_ids' => [
                'required',
                'array',
                'min:1',
                'max:50',
            ],

            'category_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('categories', 'id'),
            ],

            /*
             * اطلاعات مکانی
             */
            /*
             * اطلاعات مکانی
             */
            'province_id' => [
                'required',
                'integer',
                Rule::exists(
                    'provinces',
                    'id',
                ),
            ],

            'city_id' => [
                'required',
                'integer',
                Rule::exists(
                    'cities',
                    'id',
                ),
            ],

            'neighborhood_id' => [
                'nullable',
                'integer',
                Rule::exists(
                    'neighborhoods',
                    'id',
                ),
            ],

            'address' => [
                'required',
                'string',
                'max:2000',
            ],

            'postal_code' => [
                'nullable',
                'string',
                'max:20',
            ],

            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'gt:-180',
                'lte:180',
            ],

            /*
             * اطلاعات تماس
             */
            'mobile' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\+?[0-9]{7,20}$/',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\+?[0-9]{7,20}$/',
            ],

            'whatsapp' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\+?[0-9]{7,20}$/',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'website' => [
                'nullable',
                'url:http,https',
                'max:255',
            ],

            /*
             * تصاویر
             */
            'logo' => [
                'nullable',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],

            'cover_image' => [
                'nullable',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:5120',
            ],

            'owner_photo' => [
                'nullable',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:3072',
            ],

            'remove_logo' => [
                'nullable',
                'boolean',
            ],

            'remove_cover_image' => [
                'nullable',
                'boolean',
            ],

            'remove_owner_photo' => [
                'nullable',
                'boolean',
            ],

            /*
             * اطلاعات صنفی
             */
            'union_membership_code' => [
                'nullable',
                'string',
                'max:100',
                $membershipCodeUnique,
            ],

            'business_license_number' => [
                'nullable',
                'string',
                'max:100',
                $licenseNumberUnique,
            ],

            'business_license_issued_at' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'business_license_expires_at' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:business_license_issued_at',
            ],

            'business_license_status' => [
                'required',
                Rule::enum(BusinessLicenseStatus::class),
            ],

            /*
             * وضعیت مدیریت
             */
            'approval_status' => [
                'required',
                Rule::enum(
                    RepairShopApprovalStatus::class,
                ),
            ],

            'rejection_reason' => [
                'nullable',
                'string',
                'max:3000',
                Rule::requiredIf(
                    fn (): bool =>
                        $this->input('approval_status') ===
                        RepairShopApprovalStatus::Rejected->value,
                ),
            ],

            'is_union_member' => [
                'required',
                'boolean',
            ],

            'is_verified' => [
                'required',
                'boolean',
            ],

            'is_featured' => [
                'required',
                'boolean',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'published_at' => [
                'nullable',
                'date',
            ],

            /*
             * نمایندگی‌ها
             */
            'agencies' => [
                'nullable',
                'array',
                'max:50',
            ],

            'agencies.*.brand_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('brands', 'id'),
            ],

            'agencies.*.certificate_number' => [
                'nullable',
                'string',
                'max:120',
            ],

            'agencies.*.certificate' => [
                'nullable',
                'file',
                'mimes:pdf,png,jpg,jpeg,webp',
                'max:5120',
            ],

            'agencies.*.remove_certificate' => [
                'nullable',
                'boolean',
            ],

            'agencies.*.issued_at' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'agencies.*.expires_at' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:agencies.*.issued_at',
            ],

            'agencies.*.status' => [
                'required',
                Rule::enum(AgencyStatus::class),
            ],

            'agencies.*.is_official' => [
                'required',
                'boolean',
            ],

            'agencies.*.notes' => [
                'nullable',
                'string',
                'max:3000',
            ],

            /*
             * محدوده‌های تحت پوشش
             */
            'service_areas' => [
                'nullable',
                'array',
                'max:30',
            ],

            'service_areas.*.id' => [
                'nullable',
                'integer',
            ],

            'service_areas.*.name' => [
                'required',
                'string',
                'max:150',
            ],

            'service_areas.*.geojson' => [
                'required',
                new ValidServiceAreaGeoJson(),
            ],

            'service_areas.*.description' => [
                'nullable',
                'string',
                'max:3000',
            ],

            'service_areas.*.is_active' => [
                'required',
                'boolean',
            ],

            'service_areas.*.sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ];
    }

    /**
     * کنترل قواعدی که بین چند فیلد یا چند جدول وابستگی دارند.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $this->validatePrimaryCategory(
                    $validator,
                );

                $this->validateLeafCategories(
                    $validator,
                );

                $this->validateCityBelongsToProvince(
                    $validator,
                );

                $this->validateNeighborhood(
                    $validator,
                );

                $this->validatePublishing(
                    $validator,
                );
                $this->validateServiceAreaOwnership(
                    $validator,
                );
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'نام تعمیرگاه',
            'slug' => 'نامک',
            'owner_name' => 'نام صاحب امتیاز',
            'professional_title' => 'عنوان تخصصی',
            'primary_category_id' => 'تخصص اصلی',
            'category_ids' => 'تخصص‌ها',
            'province_id' => 'استان',
            'city_id' => 'شهر',
            'neighborhood_id' => 'محله',
            'address' => 'آدرس',
            'latitude' => 'عرض جغرافیایی',
            'longitude' => 'طول جغرافیایی',
            'mobile' => 'شماره همراه',
            'phone' => 'تلفن ثابت',
            'whatsapp' => 'واتساپ',
            'logo' => 'لوگو',
            'cover_image' => 'تصویر کاور',
            'owner_photo' => 'عکس صاحب امتیاز',
            'business_license_number' => 'شماره پروانه کسب',
            'business_license_expires_at' => 'تاریخ اعتبار پروانه',
            'approval_status' => 'وضعیت تأیید',
            'rejection_reason' => 'علت رد',
            'agencies' => 'نمایندگی‌ها',
            'agencies.*.brand_id' => 'برند نمایندگی',
            'agencies.*.certificate' => 'مدرک نمایندگی',
            'service_areas' => 'مناطق تحت پوشش',
            'service_areas.*.name' => 'نام محدوده',
            'service_areas.*.geojson' => 'مختصات محدوده',
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' =>
                'نامک فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.',

            'mobile.regex' =>
                'فرمت شماره همراه معتبر نیست.',

            'phone.regex' =>
                'فرمت تلفن ثابت معتبر نیست.',

            'whatsapp.regex' =>
                'فرمت شماره واتساپ معتبر نیست.',

            'rejection_reason.required' =>
                'در صورت رد تعمیرگاه، واردکردن علت رد الزامی است.',

            'category_ids.min' =>
                'حداقل یک تخصص باید انتخاب شود.',

            'agencies.*.brand_id.distinct' =>
                'هر برند فقط یک‌بار قابل انتخاب است.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'province_id' =>
                $this->filled('province_id')
                    ? $this->integer(
                    'province_id',
                )
                    : null,

            'city_id' =>
                $this->filled('city_id')
                    ? $this->integer(
                    'city_id',
                )
                    : null,

            'neighborhood_id' =>
                $this->filled(
                    'neighborhood_id',
                )
                    ? $this->integer(
                    'neighborhood_id',
                )
                    : null,
            'mobile' => $this->normalizePhone(
                $this->input('mobile'),
            ),

            'phone' => $this->normalizePhone(
                $this->input('phone'),
            ),

            'whatsapp' => $this->normalizePhone(
                $this->input('whatsapp'),
            ),

            'postal_code' => $this->normalizeDigits(
                $this->input('postal_code'),
            ),

            'latitude' => $this->normalizeDigits(
                $this->input('latitude'),
            ),

            'longitude' => $this->normalizeDigits(
                $this->input('longitude'),
            ),
        ]);
    }

    private function validatePrimaryCategory(
        Validator $validator,
    ): void {
        $primaryCategoryId = (int) $this->input(
            'primary_category_id',
        );

        $categoryIds = array_map(
            'intval',
            $this->input('category_ids', []),
        );

        if (
            $primaryCategoryId > 0 &&
            !in_array(
                $primaryCategoryId,
                $categoryIds,
                true,
            )
        ) {
            $validator->errors()->add(
                'primary_category_id',
                'تخصص اصلی باید در میان تخصص‌های انتخاب‌شده باشد.',
            );
        }
    }

    private function validateLeafCategories(
        Validator $validator,
    ): void {
        $categoryIds = array_map(
            'intval',
            $this->input('category_ids', []),
        );

        if ($categoryIds === []) {
            return;
        }

        $parentCategories = Category::query()
            ->whereIn('id', $categoryIds)
            ->whereHas('children')
            ->pluck('name');

        if ($parentCategories->isNotEmpty()) {
            $validator->errors()->add(
                'category_ids',
                'فقط دسته‌بندی‌های نهایی قابل انتخاب هستند: '
                . $parentCategories->implode('، '),
            );
        }
    }

    private function validateCityBelongsToProvince(
        Validator $validator,
    ): void {
        $provinceId = $this->integer(
            'province_id',
        );

        $cityId = $this->integer(
            'city_id',
        );

        if (
            $provinceId <= 0 ||
            $cityId <= 0
        ) {
            return;
        }

        $cityBelongsToProvince =
            City::query()
                ->whereKey($cityId)
                ->where(
                    'province_id',
                    $provinceId,
                )
                ->exists();

        if (!$cityBelongsToProvince) {
            $validator->errors()->add(
                'city_id',
                'شهر انتخاب‌شده متعلق به استان انتخاب‌شده نیست.',
            );
        }
    }

    private function validateNeighborhood(
        Validator $validator,
    ): void {
        $neighborhoodId = $this->input(
            'neighborhood_id',
        );

        if (!$neighborhoodId) {
            return;
        }

        $belongsToCity = Neighborhood::query()
            ->whereKey($neighborhoodId)
            ->where(
                'city_id',
                $this->integer('city_id'),
            )
            ->exists();

        if (!$belongsToCity) {
            $validator->errors()->add(
                'neighborhood_id',
                'محله انتخاب‌شده متعلق به شهر انتخاب‌شده نیست.',
            );
        }
    }

    private function validatePublishing(
        Validator $validator,
    ): void {
        if (
            $this->filled('published_at') &&
            $this->input('approval_status') !==
            RepairShopApprovalStatus::Approved->value
        ) {
            $validator->errors()->add(
                'published_at',
                'فقط تعمیرگاه تأییدشده قابل انتشار است.',
            );
        }
    }

    private function validateServiceAreaOwnership(
        Validator $validator,
    ): void {
        $repairShop = $this->route('repair_shop');

        if (!$repairShop instanceof RepairShop) {
            return;
        }

        $areaIds = collect(
            $this->input('service_areas', []),
        )
            ->pluck('id')
            ->filter()
            ->map(fn (mixed $id): int => (int) $id)
            ->values();

        if ($areaIds->isEmpty()) {
            return;
        }

        $invalidAreaExists =
            RepairShopServiceArea::query()
                ->whereIn('id', $areaIds)
                ->where(
                    'repair_shop_id',
                    '!=',
                    $repairShop->id,
                )
                ->exists();

        if ($invalidAreaExists) {
            $validator->errors()->add(
                'service_areas',
                'یکی از محدوده‌های ارسال‌شده متعلق به این تعمیرگاه نیست.',
            );
        }
    }

    private function ignoreRepairShop(
        Unique $rule,
        RepairShop $repairShop,
    ): void {
        $rule->ignore($repairShop->id);
    }

    private function normalizePhone(
        mixed $value,
    ): mixed {
        if (!is_string($value)) {
            return $value;
        }

        $value = $this->normalizeDigits($value);

        $value = preg_replace(
            '/[\s\-\(\)]/u',
            '',
            $value,
        );

        return $value === ''
            ? null
            : $value;
    }

    private function normalizeDigits(
        mixed $value,
    ): mixed {
        if (!is_string($value)) {
            return $value;
        }

        return strtr(
            trim($value),
            [
                '۰' => '0',
                '۱' => '1',
                '۲' => '2',
                '۳' => '3',
                '۴' => '4',
                '۵' => '5',
                '۶' => '6',
                '۷' => '7',
                '۸' => '8',
                '۹' => '9',

                '٠' => '0',
                '١' => '1',
                '٢' => '2',
                '٣' => '3',
                '٤' => '4',
                '٥' => '5',
                '٦' => '6',
                '٧' => '7',
                '٨' => '8',
                '٩' => '9',
            ],
        );
    }
}
