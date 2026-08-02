import { Head } from '@inertiajs/react';

import BrandForm from '@/components/admin/brands/brand-form';
import AppLayout from '@/layouts/app-layout';

import type { BrandFormData } from '@/types/brand';

const initialValues: BrandFormData = {
    name: '',
    slug: '',
    logo: null,
    remove_logo: false,
    description: '',
    website: '',
    sort_order: 0,
    is_active: true,
};

export default function CreateBrandPage() {
    return (
        <>
            <Head title="ایجاد برند" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-5xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ایجاد برند
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        برندهای قابل انتخاب برای نمایندگی
                        تعمیرگاه‌ها را مدیریت کنید.
                    </p>
                </div>

                <BrandForm
                    mode="create"
                    initialValues={initialValues}
                />
            </main>
        </>
    );
}
