import { Head } from '@inertiajs/react';

import ProvinceForm from '@/components/admin/provinces/province-form';

import type {
    ProvinceFormData,
} from '@/types/province';

const initialValues: ProvinceFormData = {
    name: '',
    slug: '',
    code: '',

    latitude: '',
    longitude: '',
    map_zoom: 8,

    sort_order: 0,
    is_active: true,
};

export default function CreateProvincePage() {
    return (
        <>
            <Head title="ایجاد استان" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-6xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ایجاد استان
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        اطلاعات استان و مرکز
                        نمایشی آن روی نقشه را ثبت
                        کنید.
                    </p>
                </div>

                <ProvinceForm
                    mode="create"
                    initialValues={
                        initialValues
                    }
                />
            </main>
        </>
    );
}
