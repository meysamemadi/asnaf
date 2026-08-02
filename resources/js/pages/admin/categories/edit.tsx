import { Head } from '@inertiajs/react';

import CategoryForm from '@/components/admin/categories/category-form';
import AppLayout from '@/layouts/app-layout';

import type {
    CategoryFormData,
    CategoryIconOption,
    EditableCategory,
    ParentOption,
} from '@/types/category';

interface EditCategoryPageProps {
    category: EditableCategory;
    parentOptions: ParentOption[];
    icons: CategoryIconOption[];
}

export default function EditCategoryPage({
                                             category,
                                             parentOptions,
                                             icons,
                                         }: EditCategoryPageProps) {
    const initialValues: CategoryFormData = {
        parent_id: category.parent_id,
        name: category.name,
        slug: category.slug ?? '',
        icon: category.icon ?? '',
        icon_library: category.icon_library ?? '',
        description: category.description ?? '',
        sort_order: category.sort_order,
        is_active: category.is_active,
    };

    return (
        <>
            <Head title={`ویرایش ${category.name}`} />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-5xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ویرایش دسته‌بندی
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        اطلاعات دسته «{category.name}» را ویرایش
                        کنید.
                    </p>
                </div>

                <CategoryForm
                    mode="edit"
                    categoryId={category.id}
                    initialValues={initialValues}
                    parentOptions={parentOptions}
                    icons={icons}
                />
            </main>
        </>
    );
}
