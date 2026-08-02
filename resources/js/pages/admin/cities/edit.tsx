import { Head } from '@inertiajs/react';

import CityForm from '@/components/admin/cities/city-form';

import type {
    CityFormData,
    CityProvinceOption,
    EditableCity,
} from '@/types/city';

interface EditCityPageProps {
    city: EditableCity;
    provinces: CityProvinceOption[];
}

export default function EditCityPage({
                                         city,
                                         provinces,
                                     }: EditCityPageProps) {
    const initialValues: CityFormData = {
        province_id: city.province_id,

        name: city.name,
        slug: city.slug,
        code: city.code ?? '',

        latitude:
            city.latitude !== null
                ? String(city.latitude)
                : '',

        longitude:
            city.longitude !== null
                ? String(city.longitude)
                : '',

        map_zoom: city.map_zoom,

        sort_order: city.sort_order,
        is_active: city.is_active,
    };

    return (
        <>
            <Head
                title={`ویرایش ${city.name}`}
            />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-6xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ویرایش شهر
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        اطلاعات شهر «{city.name}»
                        را ویرایش کنید.
                    </p>
                </div>

                <CityForm
                    mode="edit"
                    cityId={city.id}
                    initialValues={
                        initialValues
                    }
                    provinces={provinces}
                />
            </main>
        </>
    );
}
