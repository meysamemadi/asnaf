import { Head } from '@inertiajs/react';

import RepairShopForm from '@/components/admin/repair-shops/repair-shop-form';
import AppLayout from '@/layouts/app-layout';

import type {
    RepairShopFormData,
    RepairShopFormOptions,
    RepairShopLocationCityOption,
    RepairShopNeighborhoodOption,
} from '@/types/repair-shop';

interface CreateRepairShopPageProps {
    options: RepairShopFormOptions;
    cities: RepairShopLocationCityOption[];
    neighborhoods: RepairShopNeighborhoodOption[];
}

export default function CreateRepairShopPage({
                                                 options,
                                                 cities,
                                                 neighborhoods,
                                             }: CreateRepairShopPageProps) {
    const initialValues: RepairShopFormData = {
        name: '',
        slug: '',

        owner_name: '',
        professional_title: '',

        short_description: '',
        description: '',

        primary_category_id: null,
        category_ids: [],

        province_id: null,
        city_id: null,
        neighborhood_id: null,

        address: '',
        postal_code: '',

        latitude: '',
        longitude: '',

        mobile: '',
        phone: '',
        whatsapp: '',
        email: '',
        website: '',

        logo: null,
        cover_image: null,
        owner_photo: null,

        remove_logo: false,
        remove_cover_image: false,
        remove_owner_photo: false,

        union_membership_code: '',

        business_license_number: '',
        business_license_issued_at: '',
        business_license_expires_at: '',
        business_license_status: 'pending',

        approval_status: 'pending',
        rejection_reason: '',

        is_union_member: false,
        is_verified: false,
        is_featured: false,
        is_active: true,

        sort_order: 0,
        published_at: '',

        agencies: [],
        service_areas: [],
    };

    return (
        <>
            <Head title="ایجاد تعمیرگاه" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-7xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ایجاد تعمیرگاه
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        اطلاعات واحد صنفی و محل دقیق
                        تعمیرگاه را ثبت کنید.
                    </p>
                </div>

                <RepairShopForm
                    mode="create"
                    initialValues={initialValues}
                    options={options}
                    initialCities={cities}
                    initialNeighborhoods={
                        neighborhoods
                    }
                />
            </main>
        </>
    );
}
