<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Category $category */
        $category = $this->route('category');

        $allowedIcons = collect(config('category-icons'))
            ->pluck('value')
            ->all();

        return [
            'parent_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                Rule::notIn([$category->id]),
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('categories', 'slug')
                    ->ignore($category->id),
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],

            'icon_library' => [
                'nullable',
                'string',
                Rule::in(config('category-icons.libraries')),
            ],

            'icon' => [
                'nullable',
                'string',
                'max:120',
                'regex:/^[A-Z][A-Za-z0-9]+$/',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
                'max:999999',
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
            'parent_id' => 'دسته والد',
            'name' => 'نام دسته‌بندی',
            'slug' => 'نامک',
            'icon' => 'آیکون',
            'description' => 'توضیحات',
            'sort_order' => 'ترتیب نمایش',
            'is_active' => 'وضعیت',
        ];
    }

    public function messages(): array
    {
        return [
            'parent_id.not_in' => 'یک دسته‌بندی نمی‌تواند والد خودش باشد.',
            'slug.regex' => 'نامک فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.',
            'icon.in' => 'آیکون انتخاب‌شده معتبر نیست.',
        ];
    }
}
