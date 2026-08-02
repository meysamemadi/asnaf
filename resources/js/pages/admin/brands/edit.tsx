import { Head } from '@inertiajs/react';

import BrandForm from '@/components/admin/brands/brand-form';
import AppLayout from '@/layouts/app-layout';

import type {
    BrandFormData,
    EditableBrand,
} from '@/types/brand';

interface EditBrandPageProps {
    brand: EditableBrand;
}

export default function EditBrandPage({
                                          brand,
                                      }: EditBrandPageProps) {
    const initialValues: BrandFormData = {
        name: brand.name,
        slug: brand.slug ?? '',
        logo: null,
        remove_logo: false,
        description: brand.description ?? '',
        website: brand.website ?? '',
        sort_order: brand.sort_order,
        is_active: brand.is_active,
    };

    return (
        <>
            <Head title={`ویرایش ${brand.name}`} />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-5xl p-4 md:p-6"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        ویرایش برند
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        ویرایش اطلاعات برند «{brand.name}»
                    </p>
                </div>

                <BrandForm
                    mode="edit"
                    brandId={brand.id}
                    initialValues={initialValues}
                    initialLogoUrl={brand.logo_url}
                />
            </main>
        </>
    );
}
