import { Head } from '@inertiajs/react';

import NeighborhoodForm from '@/components/admin/neighborhoods/neighborhood-form';

import type {
    NeighborhoodCityOption,
    NeighborhoodFormData,
    NeighborhoodProvinceOption,
} from '@/types/neighborhood';

interface CreateNeighborhoodPageProps {
    provinces: NeighborhoodProvinceOption[];
    cities: NeighborhoodCityOption[];

    selectedProvinceId: number | null;
}

export default function CreateNeighborhoodPage({
                                                   provinces,
                                                   cities,
                                                   selectedProvinceId,
                                               }: CreateNeighborhoodPageProps) {
    const initialValues: NeighborhoodFormData = {
        province_id:
            selectedProvinceId ?? null,

        city_id: null,

        name: '',
        slug: '',

        latitude: '',
        longitude: '',
        map_zoom: 15,

        sort_order: 0,
        is_active: true,
    };

    return (
        <>
            <Head title="ایجاد محله" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-6xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ایجاد محله
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        استان، شهر و مرکز نمایشی
                        محله را مشخص کنید.
                    </p>
                </div>

                <NeighborhoodForm
                    mode="create"
                    initialValues={
                        initialValues
                    }
                    provinces={provinces}
                    initialCities={cities}
                />
            </main>
        </>
    );
}
