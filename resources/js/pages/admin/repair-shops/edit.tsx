import { Head } from '@inertiajs/react';

import RepairShopForm from '@/components/admin/repair-shops/repair-shop-form';
import AppLayout from '@/layouts/app-layout';

import type {
    EditableRepairShop,
    RepairShopFormData,
    RepairShopFormOptions,
    RepairShopLocationCityOption,
    RepairShopNeighborhoodOption,
} from '@/types/repair-shop';

interface EditRepairShopPageProps {
    repairShop: EditableRepairShop;

    options: RepairShopFormOptions;

    cities: RepairShopLocationCityOption[];

    neighborhoods: RepairShopNeighborhoodOption[];
}

export default function EditRepairShopPage({
                                               repairShop,
                                               options,
                                               cities,
                                               neighborhoods,
                                           }: EditRepairShopPageProps) {
    const initialValues: RepairShopFormData = {
        name: repairShop.name,
        slug: repairShop.slug,

        owner_name: repairShop.owner_name,

        professional_title:
            repairShop.professional_title ?? '',

        short_description:
            repairShop.short_description ?? '',

        description:
            repairShop.description ?? '',

        primary_category_id:
        repairShop.primary_category_id,

        category_ids:
        repairShop.category_ids,

        province_id:
        repairShop.province_id,

        city_id:
        repairShop.city_id,

        neighborhood_id:
        repairShop.neighborhood_id,

        address: repairShop.address,

        postal_code:
            repairShop.postal_code ?? '',

        latitude: String(
            repairShop.latitude,
        ),

        longitude: String(
            repairShop.longitude,
        ),

        mobile: repairShop.mobile ?? '',
        phone: repairShop.phone ?? '',
        whatsapp:
            repairShop.whatsapp ?? '',
        email: repairShop.email ?? '',
        website: repairShop.website ?? '',

        logo: null,
        cover_image: null,
        owner_photo: null,

        remove_logo: false,
        remove_cover_image: false,
        remove_owner_photo: false,

        union_membership_code:
            repairShop.union_membership_code ??
            '',

        business_license_number:
            repairShop.business_license_number ??
            '',

        business_license_issued_at:
            repairShop.business_license_issued_at ??
            '',

        business_license_expires_at:
            repairShop.business_license_expires_at ??
            '',

        business_license_status:
        repairShop.business_license_status,

        approval_status:
        repairShop.approval_status,

        rejection_reason:
            repairShop.rejection_reason ?? '',

        is_union_member:
        repairShop.is_union_member,

        is_verified:
        repairShop.is_verified,

        is_featured:
        repairShop.is_featured,

        is_active:
        repairShop.is_active,

        sort_order:
        repairShop.sort_order,

        published_at:
            repairShop.published_at ?? '',

        /*
         * تا قبل از اضافه‌شدن UI نمایندگی‌ها،
         * داده‌های موجود حفظ می‌شوند.
         */
        agencies: repairShop.agencies.map(
            (agency, index) => ({
                client_id: `agency-${agency.brand_id}-${index}`,

                brand_id: agency.brand_id,

                brand_name:
                agency.brand_name,

                certificate_number:
                    agency.certificate_number ?? '',

                certificate: null,

                certificate_path:
                agency.certificate_path,

                certificate_url:
                agency.certificate_url,

                remove_certificate: false,

                issued_at:
                    agency.issued_at ?? '',

                expires_at:
                    agency.expires_at ?? '',

                status: agency.status,

                is_official:
                agency.is_official,

                notes:
                    agency.notes ?? '',
            }),
        ),

        /*
         * محدوده‌های موجود نیز تا مرحله بعد
         * بدون تغییر دوباره ارسال می‌شوند.
         */
        service_areas:
            repairShop.service_areas.map(
                (area) => ({
                    client_id:
                        `service-area-persisted-${area.id}`,

                    id: area.id,
                    name: area.name,
                    geojson: area.geojson,

                    description:
                        area.description ?? '',

                    is_active:
                    area.is_active,

                    sort_order:
                    area.sort_order,
                }),
            ),
    };

    return (
        <>
            <Head
                title={`ویرایش ${repairShop.name}`}
            />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-7xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ویرایش تعمیرگاه
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        ویرایش اطلاعات «
                        {repairShop.name}»
                    </p>
                </div>

                <RepairShopForm
                    mode="edit"
                    repairShopId={
                        repairShop.id
                    }
                    initialValues={
                        initialValues
                    }
                    options={options}
                    initialCities={cities}
                    initialNeighborhoods={
                        neighborhoods
                    }
                    existingImages={{
                        logoUrl:
                        repairShop.logo_url,

                        coverImageUrl:
                        repairShop.cover_image_url,

                        ownerPhotoUrl:
                        repairShop.owner_photo_url,
                    }}
                />
            </main>
        </>
    );
}
