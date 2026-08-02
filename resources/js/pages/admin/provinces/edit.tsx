import { Head } from '@inertiajs/react';

import ProvinceForm from '@/components/admin/provinces/province-form';

import type {
    EditableProvince,
    ProvinceFormData,
} from '@/types/province';

interface EditProvincePageProps {
    province: EditableProvince;
}

export default function EditProvincePage({
                                             province,
                                         }: EditProvincePageProps) {
    const initialValues:
        ProvinceFormData = {
        name: province.name,
        slug: province.slug,
        code: province.code ?? '',

        latitude:
            province.latitude !== null
                ? String(
                    province.latitude,
                )
                : '',

        longitude:
            province.longitude !== null
                ? String(
                    province.longitude,
                )
                : '',

        map_zoom:
        province.map_zoom,

        sort_order:
        province.sort_order,

        is_active:
        province.is_active,
    };

    return (
        <>
            <Head
                title={`ویرایش ${province.name}`}
            />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-6xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ویرایش استان
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        اطلاعات استان «
                        {province.name}» را ویرایش
                        کنید.
                    </p>
                </div>

                <ProvinceForm
                    mode="edit"
                    provinceId={
                        province.id
                    }
                    initialValues={
                        initialValues
                    }
                />
            </main>
        </>
    );
}
