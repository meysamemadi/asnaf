<?php

namespace App\Http\Requests\Admin;

use App\Models\City;
use App\Models\Neighborhood;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateNeighborhoodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'province_id' => $this->filled('province_id')
                ? $this->integer('province_id')
                : null,

            'city_id' => $this->filled('city_id')
                ? $this->integer('city_id')
                : null,

            'name' => $this->filled('name')
                ? $this->string('name')->trim()->value()
                : null,

            'slug' => $this->filled('slug')
                ? $this->string('slug')->trim()->value()
                : null,

            'latitude' => $this->filled('latitude')
                ? $this->input('latitude')
                : null,

            'longitude' => $this->filled('longitude')
                ? $this->input('longitude')
                : null,

            'map_zoom' => $this->filled('map_zoom')
                ? $this->integer('map_zoom')
                : 15,

            'sort_order' => $this->filled('sort_order')
                ? $this->integer('sort_order')
                : 0,

            'is_active' => $this->boolean(
                'is_active',
            ),
        ]);
    }

    public function rules(): array
    {
        /** @var Neighborhood $neighborhood */
        $neighborhood = $this->route(
            'neighborhood',
        );

        return [
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

            'name' => [
                'required',
                'string',
                'max:120',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:140',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',

                Rule::unique(
                    'neighborhoods',
                    'slug',
                )
                    ->where(
                        fn ($query) =>
                        $query->where(
                            'city_id',
                            $this->integer(
                                'city_id',
                            ),
                        ),
                    )
                    ->ignore(
                        $neighborhood->id,
                    ),
            ],

            'latitude' => [
                'nullable',
                'required_with:longitude',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'nullable',
                'required_with:latitude',
                'numeric',
                'between:-180,180',
            ],

            'map_zoom' => [
                'required',
                'integer',
                'between:4,19',
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:65535',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (
                    !$this->filled('province_id') ||
                    !$this->filled('city_id')
                ) {
                    return;
                }

                $cityBelongsToProvince =
                    City::query()
                        ->whereKey(
                            $this->integer(
                                'city_id',
                            ),
                        )
                        ->where(
                            'province_id',
                            $this->integer(
                                'province_id',
                            ),
                        )
                        ->exists();

                if (!$cityBelongsToProvince) {
                    $validator->errors()->add(
                        'city_id',
                        'شهر انتخاب‌شده متعلق به استان انتخاب‌شده نیست.',
                    );
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'province_id' => 'استان',
            'city_id' => 'شهر',

            'name' => 'نام محله',
            'slug' => 'نامک محله',

            'latitude' => 'عرض جغرافیایی',
            'longitude' => 'طول جغرافیایی',
            'map_zoom' => 'بزرگ‌نمایی نقشه',

            'sort_order' => 'ترتیب نمایش',
            'is_active' => 'وضعیت محله',
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' =>
                'نامک فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.',

            'latitude.required_with' =>
                'در صورت ثبت طول جغرافیایی، عرض جغرافیایی نیز الزامی است.',

            'longitude.required_with' =>
                'در صورت ثبت عرض جغرافیایی، طول جغرافیایی نیز الزامی است.',
        ];
    }
}
