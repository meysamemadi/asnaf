<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCityRequest extends FormRequest
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

            'name' => $this->filled('name')
                ? $this->string('name')->trim()->value()
                : null,

            'slug' => $this->filled('slug')
                ? $this->string('slug')->trim()->value()
                : null,

            'code' => $this->filled('code')
                ? $this->string('code')->trim()->value()
                : null,

            'latitude' => $this->filled('latitude')
                ? $this->input('latitude')
                : null,

            'longitude' => $this->filled('longitude')
                ? $this->input('longitude')
                : null,

            'map_zoom' => $this->filled('map_zoom')
                ? $this->integer('map_zoom')
                : 12,

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
        return [
            'province_id' => [
                'required',
                'integer',
                Rule::exists(
                    'provinces',
                    'id',
                ),
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:120',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',

                Rule::unique(
                    'cities',
                    'slug',
                )->where(
                    fn ($query) =>
                    $query->where(
                        'province_id',
                        $this->integer(
                            'province_id',
                        ),
                    ),
                ),
            ],

            /*
             * طبق Migration فعلی، code در کل
             * جدول cities یکتا است.
             */
            'code' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique(
                    'cities',
                    'code',
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
                'between:4,18',
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

    public function attributes(): array
    {
        return [
            'province_id' => 'استان',
            'name' => 'نام شهر',
            'slug' => 'نامک شهر',
            'code' => 'کد شهر',

            'latitude' => 'عرض جغرافیایی',
            'longitude' => 'طول جغرافیایی',
            'map_zoom' => 'بزرگ‌نمایی نقشه',

            'sort_order' => 'ترتیب نمایش',
            'is_active' => 'وضعیت شهر',
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
