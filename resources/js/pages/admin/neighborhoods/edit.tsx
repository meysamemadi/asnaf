import { Head } from '@inertiajs/react';

import NeighborhoodForm from '@/components/admin/neighborhoods/neighborhood-form';

import type {
    EditableNeighborhood,
    NeighborhoodCityOption,
    NeighborhoodFormData,
    NeighborhoodProvinceOption,
} from '@/types/neighborhood';

interface EditNeighborhoodPageProps {
    neighborhood: EditableNeighborhood;

    provinces: NeighborhoodProvinceOption[];
    cities: NeighborhoodCityOption[];
}

export default function EditNeighborhoodPage({
                                                 neighborhood,
                                                 provinces,
                                                 cities,
                                             }: EditNeighborhoodPageProps) {
    const initialValues: NeighborhoodFormData = {
        province_id:
        neighborhood.province_id,

        city_id:
        neighborhood.city_id,

        name: neighborhood.name,
        slug: neighborhood.slug,

        latitude:
            neighborhood.latitude !== null
                ? String(
                    neighborhood.latitude,
                )
                : '',

        longitude:
            neighborhood.longitude !== null
                ? String(
                    neighborhood.longitude,
                )
                : '',

        map_zoom:
        neighborhood.map_zoom,

        sort_order:
        neighborhood.sort_order,

        is_active:
        neighborhood.is_active,
    };

    return (
        <>
            <Head
                title={`ویرایش ${neighborhood.name}`}
            />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-6xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ویرایش محله
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        اطلاعات محله «
                        {neighborhood.name}» را
                        ویرایش کنید.
                    </p>
                </div>

                <NeighborhoodForm
                    mode="edit"
                    neighborhoodId={
                        neighborhood.id
                    }
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
