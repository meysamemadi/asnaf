import { Head } from '@inertiajs/react';

import CategoryForm from '@/components/admin/categories/category-form';
import AppLayout from '@/layouts/app-layout';

import type {
    CategoryFormData,
    CategoryIconOption,
    ParentOption,
} from '@/types/category';

interface CreateCategoryPageProps {
    parentOptions: ParentOption[];
    icons: CategoryIconOption[];
}

const initialValues: CategoryFormData = {
    parent_id: null,
    name: '',
    slug: '',
    icon: '',
    icon_library: '',
    description: '',
    sort_order: 0,
    is_active: true,
};

export default function CreateCategoryPage({
                                               parentOptions,
                                               icons,
                                           }: CreateCategoryPageProps) {
    return (
        <>
            <Head title="ایجاد دسته‌بندی" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-5xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ایجاد دسته‌بندی
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        دسته اصلی یا زیرمجموعه جدید ایجاد کنید.
                    </p>
                </div>

                <CategoryForm
                    mode="create"
                    initialValues={initialValues}
                    parentOptions={parentOptions}
                    icons={icons}
                />
            </main>
        </>
    );
}
