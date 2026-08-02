<?php

namespace App\Http\Requests\Admin;

use App\Models\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Brand $brand */
        $brand = $this->route('brand');

        return [
            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:160',

                Rule::unique('brands', 'slug')
                    ->ignore($brand->id),

                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],

            'logo' => [
                'nullable',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],

            'remove_logo' => [
                'nullable',
                'boolean',
            ],

            'description' => [
                'nullable',
                'string',
                'max:3000',
            ],

            'website' => [
                'nullable',
                'url:http,https',
                'max:255',
            ],

            'sort_order' => [
                'nullable',
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
            'name' => 'نام برند',
            'slug' => 'نامک',
            'logo' => 'لوگوی برند',
            'description' => 'توضیحات',
            'website' => 'وب‌سایت',
            'sort_order' => 'ترتیب نمایش',
            'is_active' => 'وضعیت',
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' =>
                'نامک فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.',

            'logo.max' =>
                'حجم لوگوی برند نباید بیشتر از ۲ مگابایت باشد.',
        ];
    }
}
