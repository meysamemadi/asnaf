import { Head } from '@inertiajs/react';

import CityForm from '@/components/admin/cities/city-form';

import type {
    CityFormData,
    CityProvinceOption,
} from '@/types/city';

interface CreateCityPageProps {
    provinces: CityProvinceOption[];
}

export default function CreateCityPage({
                                           provinces,
                                       }: CreateCityPageProps) {
    const initialValues: CityFormData = {
        province_id: null,

        name: '',
        slug: '',
        code: '',

        latitude: '',
        longitude: '',
        map_zoom: 12,

        sort_order: 0,
        is_active: true,
    };

    return (
        <>
            <Head title="ایجاد شهر" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-6xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ایجاد شهر
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        استان والد، اطلاعات شهر و
                        مرکز نمایشی آن روی نقشه را
                        ثبت کنید.
                    </p>
                </div>

                <CityForm
                    mode="create"
                    initialValues={
                        initialValues
                    }
                    provinces={provinces}
                />
            </main>
        </>
    );
}
