import {
    type FormEvent,
    type ReactNode,
    useState,
} from 'react';
import {
    Link,
    useForm,
} from '@inertiajs/react';



import {
    Building2,
    FileBadge,
    Handshake,
    ImageIcon,
    Layers3,
    MapPinned,
    Phone,
    Save,
    Settings2,
    Tags,
} from 'lucide-react';

import AgencyManager from './agency-manager';
import ServiceAreaManager from './service-area-manager';
import LocationPickerMap from './location-picker-map';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type {
    RepairShopFormData,
    RepairShopFormOptions,
    RepairShopLocationCityOption,
    RepairShopNeighborhoodOption,
} from '@/types/repair-shop';

interface RepairShopFormProps {
    mode: 'create' | 'edit';

    initialValues: RepairShopFormData;

    options: RepairShopFormOptions;

    initialCities: RepairShopLocationCityOption[];

    initialNeighborhoods: RepairShopNeighborhoodOption[];

    repairShopId?: number;

    existingImages?: {
        logoUrl: string | null;
        coverImageUrl: string | null;
        ownerPhotoUrl: string | null;
    };
}


interface MapView {
    latitude: number;
    longitude: number;
    zoom: number;
}


export default function RepairShopForm({
                                           mode,
                                           initialValues,
                                           options,
                                           initialCities,
                                           initialNeighborhoods,
                                           repairShopId,
                                           existingImages = {
                                               logoUrl: null,
                                               coverImageUrl: null,
                                               ownerPhotoUrl: null,
                                           },
                                       }: RepairShopFormProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        transform,
    } = useForm<RepairShopFormData>(
        initialValues,
    );

    const errorBag = errors as Record<
        string,
        string | undefined
    >;

    const [cities, setCities] =
        useState(initialCities);

    const [
        neighborhoods,
        setNeighborhoods,
    ] = useState(initialNeighborhoods);

    const [mapView, setMapView] =
        useState<MapView | null>(null);

    const [loadingCities, setLoadingCities] =
        useState(false);

    const [
        loadingNeighborhoods,
        setLoadingNeighborhoods,
    ] = useState(false);

    const focusMapOnLocation = (
        location:
            | {
            latitude: number | null;
            longitude: number | null;
            map_zoom: number;
        }
            | null
            | undefined,
    ): void => {
        if (
            location?.latitude === null ||
            location?.latitude === undefined ||
            location.longitude === null ||
            location.longitude === undefined
        ) {
            return;
        }

        setMapView({
            latitude: location.latitude,
            longitude: location.longitude,
            zoom: location.map_zoom,
        });
    };

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        transform((currentData) => {
            if (
                mode === 'edit' &&
                repairShopId
            ) {
                return {
                    ...currentData,
                    _method: 'put',
                };
            }

            return currentData;
        });

        post(
            mode === 'create'
                ? '/admin/repair-shops'
                : `/admin/repair-shops/${repairShopId}`,
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    const changeProvince = async (
        value: string,
    ): Promise<void> => {
        const provinceId = Number(value);

        const province =
            options.provinces.find(
                (item) =>
                    item.id === provinceId,
            );

        focusMapOnLocation(province);

        setData((current) => ({
            ...current,
            province_id: provinceId,
            city_id: null,
            neighborhood_id: null,
        }));

        setCities([]);
        setNeighborhoods([]);
        setLoadingCities(true);

        try {
            const response = await fetch(
                `/admin/location-options/provinces/${provinceId}/cities`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error(
                    'دریافت شهرهای استان با خطا مواجه شد.',
                );
            }

            const result =
                (await response.json()) as {
                    data: RepairShopLocationCityOption[];
                };

            setCities(result.data);
        } catch (error) {
            console.error(
                'Loading cities failed:',
                error,
            );

            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };

    const changeCity = async (
        value: string,
    ): Promise<void> => {
        const cityId = Number(value);

        const city = cities.find(
            (item) =>
                item.id === cityId,
        );

        focusMapOnLocation(city);

        setData((current) => ({
            ...current,
            city_id: cityId,
            neighborhood_id: null,
        }));

        setNeighborhoods([]);
        setLoadingNeighborhoods(true);

        try {
            const response = await fetch(
                `/admin/location-options/cities/${cityId}/neighborhoods`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error(
                    'دریافت محله‌های شهر با خطا مواجه شد.',
                );
            }

            const result =
                (await response.json()) as {
                    data: RepairShopNeighborhoodOption[];
                };

            setNeighborhoods(result.data);
        } catch (error) {
            console.error(
                'Loading neighborhoods failed:',
                error,
            );

            setNeighborhoods([]);
        } finally {
            setLoadingNeighborhoods(false);
        }
    };

    const changeNeighborhood = (
        value: string,
    ): void => {
        if (value === 'none') {
            setData(
                'neighborhood_id',
                null,
            );

            const selectedCity =
                cities.find(
                    (city) =>
                        city.id === data.city_id,
                );

            focusMapOnLocation(
                selectedCity,
            );

            return;
        }

        const neighborhoodId =
            Number(value);

        setData(
            'neighborhood_id',
            neighborhoodId,
        );

        const neighborhood =
            neighborhoods.find(
                (item) =>
                    item.id ===
                    neighborhoodId,
            );

        /*
         * اگر محله مختصات نداشت،
         * نقشه روی مرکز شهر باقی می‌ماند.
         */
        if (
            neighborhood?.latitude === null ||
            neighborhood?.latitude ===
            undefined ||
            neighborhood.longitude === null ||
            neighborhood.longitude ===
            undefined
        ) {
            const selectedCity =
                cities.find(
                    (city) =>
                        city.id === data.city_id,
                );

            focusMapOnLocation(
                selectedCity,
            );

            return;
        }

        focusMapOnLocation(
            neighborhood,
        );
    };

    const toggleCategory = (
        categoryId: number,
        checked: boolean,
    ) => {
        setData((current) => {
            const categoryIds = checked
                ? Array.from(
                    new Set([
                        ...current.category_ids,
                        categoryId,
                    ]),
                )
                : current.category_ids.filter(
                    (id) => id !== categoryId,
                );

            const primaryCategoryId =
                categoryIds.includes(
                    current.primary_category_id ??
                    0,
                )
                    ? current.primary_category_id
                    : null;

            return {
                ...current,
                category_ids: categoryIds,
                primary_category_id:
                primaryCategoryId,
            };
        });
    };

    const latitude =
        data.latitude.trim() === ''
            ? null
            : Number(data.latitude);

    const longitude =
        data.longitude.trim() === ''
            ? null
            : Number(data.longitude);

    return (
        <form
            onSubmit={submit}
            noValidate
            className="space-y-6"
        >
            <FormSection
                title="اطلاعات اصلی"
                icon={<Building2 className="size-5" />}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                        label="نام تعمیرگاه"
                        htmlFor="name"
                        error={errors.name}
                        required
                    >
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData(
                                    'name',
                                    event.target.value,
                                )
                            }
                            placeholder="برای مثال: امداد تکنیک گیلان"
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="نامک انگلیسی"
                        htmlFor="slug"
                        error={errors.slug}
                        description="در صورت خالی‌بودن، به‌صورت خودکار ساخته می‌شود."
                    >
                        <Input
                            id="slug"
                            dir="ltr"
                            value={data.slug}
                            onChange={(event) =>
                                setData(
                                    'slug',
                                    normalizeSlug(
                                        event.target
                                            .value,
                                    ),
                                )
                            }
                            placeholder="emdad-technic-gilan"
                            className="text-left"
                        />
                    </FormField>

                    <FormField
                        label="نام صاحب امتیاز"
                        htmlFor="owner_name"
                        error={errors.owner_name}
                        required
                    >
                        <Input
                            id="owner_name"
                            value={data.owner_name}
                            onChange={(event) =>
                                setData(
                                    'owner_name',
                                    event.target.value,
                                )
                            }
                            placeholder="نام و نام خانوادگی"
                        />
                    </FormField>

                    <FormField
                        label="عنوان تخصصی"
                        htmlFor="professional_title"
                        error={
                            errors.professional_title
                        }
                    >
                        <Input
                            id="professional_title"
                            value={
                                data.professional_title
                            }
                            onChange={(event) =>
                                setData(
                                    'professional_title',
                                    event.target.value,
                                )
                            }
                            placeholder="برای مثال: مهندس تأسیسات"
                        />
                    </FormField>
                </div>

                <FormField
                    label="توضیح کوتاه"
                    htmlFor="short_description"
                    error={
                        errors.short_description
                    }
                >
                    <Textarea
                        id="short_description"
                        rows={3}
                        maxLength={500}
                        value={
                            data.short_description
                        }
                        onChange={(event) =>
                            setData(
                                'short_description',
                                event.target.value,
                            )
                        }
                        placeholder="معرفی کوتاه برای نمایش در کارت تعمیرگاه"
                    />
                </FormField>

                <FormField
                    label="توضیحات کامل"
                    htmlFor="description"
                    error={errors.description}
                >
                    <Textarea
                        id="description"
                        rows={7}
                        value={data.description}
                        onChange={(event) =>
                            setData(
                                'description',
                                event.target.value,
                            )
                        }
                        placeholder="شرح کامل خدمات، سوابق و توانمندی‌ها..."
                    />
                </FormField>
            </FormSection>

            <FormSection
                title="تخصص‌ها"
                icon={<Tags className="size-5" />}
            >
                {options.categories.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        هنوز دسته‌بندی نهایی و فعالی
                        تعریف نشده است.
                    </div>
                ) : (
                    <>
                        <FormField
                            label="تخصص‌های تعمیرگاه"
                            htmlFor="category_ids"
                            error={errors.category_ids}
                            required
                        >
                            <div className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3">
                                {options.categories.map(
                                    (category) => {
                                        const checked =
                                            data.category_ids.includes(
                                                category.id,
                                            );

                                        return (
                                            <label
                                                key={
                                                    category.id
                                                }
                                                className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
                                            >
                                                <Checkbox
                                                    checked={
                                                        checked
                                                    }
                                                    onCheckedChange={(
                                                        value,
                                                    ) =>
                                                        toggleCategory(
                                                            category.id,
                                                            value ===
                                                            true,
                                                        )
                                                    }
                                                />

                                                <span className="text-sm">
                                                    {
                                                        category.label
                                                    }
                                                </span>
                                            </label>
                                        );
                                    },
                                )}
                            </div>
                        </FormField>

                        <FormField
                            label="تخصص اصلی"
                            htmlFor="primary_category_id"
                            error={
                                errors.primary_category_id
                            }
                            required
                        >
                            <Select
                                value={
                                    data.primary_category_id
                                        ? String(
                                            data.primary_category_id,
                                        )
                                        : ''
                                }
                                onValueChange={(value) =>
                                    setData(
                                        'primary_category_id',
                                        Number(value),
                                    )
                                }
                                disabled={
                                    data.category_ids
                                        .length === 0
                                }
                            >
                                <SelectTrigger id="primary_category_id">
                                    <SelectValue placeholder="تخصص اصلی را انتخاب کنید" />
                                </SelectTrigger>

                                <SelectContent>
                                    {options.categories
                                        .filter(
                                            (category) =>
                                                data.category_ids.includes(
                                                    category.id,
                                                ),
                                        )
                                        .map(
                                            (
                                                category,
                                            ) => (
                                                <SelectItem
                                                    key={
                                                        category.id
                                                    }
                                                    value={String(
                                                        category.id,
                                                    )}
                                                >
                                                    {
                                                        category.label
                                                    }
                                                </SelectItem>
                                            ),
                                        )}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </>
                )}
            </FormSection>

            <FormSection
                title="اطلاعات تماس"
                icon={<Phone className="size-5" />}
            >
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        label="شماره همراه"
                        htmlFor="mobile"
                        error={errors.mobile}
                    >
                        <Input
                            id="mobile"
                            dir="ltr"
                            value={data.mobile}
                            onChange={(event) =>
                                setData(
                                    'mobile',
                                    event.target.value,
                                )
                            }
                            placeholder="09123456789"
                            className="text-left"
                        />
                    </FormField>

                    <FormField
                        label="تلفن ثابت"
                        htmlFor="phone"
                        error={errors.phone}
                    >
                        <Input
                            id="phone"
                            dir="ltr"
                            value={data.phone}
                            onChange={(event) =>
                                setData(
                                    'phone',
                                    event.target.value,
                                )
                            }
                            placeholder="01312345678"
                            className="text-left"
                        />
                    </FormField>

                    <FormField
                        label="واتساپ"
                        htmlFor="whatsapp"
                        error={errors.whatsapp}
                    >
                        <Input
                            id="whatsapp"
                            dir="ltr"
                            value={data.whatsapp}
                            onChange={(event) =>
                                setData(
                                    'whatsapp',
                                    event.target.value,
                                )
                            }
                            placeholder="989123456789+"
                            className="text-left"
                        />
                    </FormField>

                    <FormField
                        label="ایمیل"
                        htmlFor="email"
                        error={errors.email}
                    >
                        <Input
                            id="email"
                            type="email"
                            dir="ltr"
                            value={data.email}
                            onChange={(event) =>
                                setData(
                                    'email',
                                    event.target.value,
                                )
                            }
                            className="text-left"
                        />
                    </FormField>

                    <FormField
                        label="وب‌سایت"
                        htmlFor="website"
                        error={errors.website}
                    >
                        <Input
                            id="website"
                            type="url"
                            dir="ltr"
                            value={data.website}
                            onChange={(event) =>
                                setData(
                                    'website',
                                    event.target.value,
                                )
                            }
                            placeholder="https://example.com"
                            className="text-left"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="آدرس و موقعیت"
                icon={<MapPinned className="size-5" />}
            >
                <div className="grid gap-5 md:grid-cols-3">
                    <FormField
                        label="استان"
                        htmlFor="province_id"
                        error={errors.province_id}
                        required
                    >
                        <Select
                            value={
                                data.province_id
                                    ? String(
                                        data.province_id,
                                    )
                                    : ''
                            }
                            onValueChange={
                                changeProvince
                            }
                        >
                            <SelectTrigger id="province_id">
                                <SelectValue placeholder="انتخاب استان" />
                            </SelectTrigger>

                            <SelectContent>
                                {options.provinces.map(
                                    (province) => (
                                        <SelectItem
                                            key={
                                                province.id
                                            }
                                            value={String(
                                                province.id,
                                            )}
                                        >
                                            {
                                                province.name
                                            }
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="شهر"
                        htmlFor="city_id"
                        error={errors.city_id}
                        required
                    >
                        <Select
                            value={
                                data.city_id
                                    ? String(
                                        data.city_id,
                                    )
                                    : ''
                            }
                            onValueChange={changeCity}
                            disabled={
                                !data.province_id ||
                                loadingCities
                            }
                        >
                            <SelectTrigger id="city_id">
                                <SelectValue
                                    placeholder={
                                        loadingCities
                                            ? 'در حال دریافت...'
                                            : 'انتخاب شهر'
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent>
                                {cities.map(
                                    (city) => (
                                        <SelectItem
                                            key={city.id}
                                            value={String(
                                                city.id,
                                            )}
                                        >
                                            {city.name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="محله"
                        htmlFor="neighborhood_id"
                        error={
                            errors.neighborhood_id
                        }
                    >
                        <Select
                            value={
                                data.neighborhood_id
                                    ? String(
                                        data.neighborhood_id,
                                    )
                                    : 'none'
                            }
                            onValueChange={changeNeighborhood}
                            disabled={
                                !data.city_id ||
                                loadingNeighborhoods
                            }
                        >
                            <SelectTrigger id="neighborhood_id">
                                <SelectValue
                                    placeholder={
                                        loadingNeighborhoods
                                            ? 'در حال دریافت...'
                                            : 'انتخاب محله'
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="none">
                                    بدون محله
                                </SelectItem>

                                {neighborhoods.map(
                                    (neighborhood) => (
                                        <SelectItem
                                            key={
                                                neighborhood.id
                                            }
                                            value={String(
                                                neighborhood.id,
                                            )}
                                        >
                                            {
                                                neighborhood.name
                                            }
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <FormField
                    label="آدرس کامل"
                    htmlFor="address"
                    error={errors.address}
                    required
                >
                    <Textarea
                        id="address"
                        rows={4}
                        value={data.address}
                        onChange={(event) =>
                            setData(
                                'address',
                                event.target.value,
                            )
                        }
                        placeholder="خیابان، کوچه، پلاک و توضیحات دسترسی"
                    />
                </FormField>

                <FormField
                    label="کد پستی"
                    htmlFor="postal_code"
                    error={errors.postal_code}
                >
                    <Input
                        id="postal_code"
                        dir="ltr"
                        value={data.postal_code}
                        onChange={(event) =>
                            setData(
                                'postal_code',
                                event.target.value,
                            )
                        }
                        className="max-w-sm text-left"
                    />
                </FormField>

                <LocationPickerMap
                    latitude={
                        Number.isFinite(latitude)
                            ? latitude
                            : null
                    }
                    longitude={
                        Number.isFinite(longitude)
                            ? longitude
                            : null
                    }
                    viewLatitude={
                        mapView?.latitude ?? null
                    }
                    viewLongitude={
                        mapView?.longitude ?? null
                    }
                    viewZoom={
                        mapView?.zoom ?? null
                    }
                    onChange={(
                        nextLatitude,
                        nextLongitude,
                    ) => {
                        setData((current) => ({
                            ...current,

                            latitude:
                                String(nextLatitude),

                            longitude:
                                String(nextLongitude),
                        }));
                    }}
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                        label="عرض جغرافیایی"
                        htmlFor="latitude"
                        error={errors.latitude}
                        required
                    >
                        <Input
                            id="latitude"
                            type="number"
                            step="0.0000001"
                            dir="ltr"
                            value={data.latitude}
                            onChange={(event) =>
                                setData(
                                    'latitude',
                                    event.target.value,
                                )
                            }
                            className="text-left"
                        />
                    </FormField>

                    <FormField
                        label="طول جغرافیایی"
                        htmlFor="longitude"
                        error={errors.longitude}
                        required
                    >
                        <Input
                            id="longitude"
                            type="number"
                            step="0.0000001"
                            dir="ltr"
                            value={data.longitude}
                            onChange={(event) =>
                                setData(
                                    'longitude',
                                    event.target.value,
                                )
                            }
                            className="text-left"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="مناطق تحت پوشش"
                icon={<Layers3 className="size-5" />}
            >
                <ServiceAreaManager
                    areas={data.service_areas}
                    centerLatitude={
                        Number.isFinite(latitude)
                            ? latitude
                            : null
                    }
                    centerLongitude={
                        Number.isFinite(longitude)
                            ? longitude
                            : null
                    }
                    errors={errorBag}
                    onChange={(serviceAreas) =>
                        setData(
                            'service_areas',
                            serviceAreas,
                        )
                    }
                />
            </FormSection>

            <FormSection
                title="تصاویر"
                icon={<ImageIcon className="size-5" />}
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    <ImageFileField
                        id="logo"
                        label="لوگوی تعمیرگاه"
                        accept="image/png,image/jpeg,image/webp"
                        existingUrl={
                            existingImages.logoUrl
                        }
                        removed={data.remove_logo}
                        file={data.logo}
                        error={errors.logo}
                        onFileChange={(file) =>
                            setData((current) => ({
                                ...current,
                                logo: file,
                                remove_logo: false,
                            }))
                        }
                        onRemoveChange={(checked) =>
                            setData(
                                'remove_logo',
                                checked,
                            )
                        }
                    />

                    <ImageFileField
                        id="cover_image"
                        label="تصویر کاور"
                        accept="image/png,image/jpeg,image/webp"
                        existingUrl={
                            existingImages.coverImageUrl
                        }
                        removed={
                            data.remove_cover_image
                        }
                        file={data.cover_image}
                        error={errors.cover_image}
                        onFileChange={(file) =>
                            setData((current) => ({
                                ...current,
                                cover_image: file,
                                remove_cover_image:
                                    false,
                            }))
                        }
                        onRemoveChange={(checked) =>
                            setData(
                                'remove_cover_image',
                                checked,
                            )
                        }
                    />

                    <ImageFileField
                        id="owner_photo"
                        label="عکس صاحب امتیاز"
                        accept="image/png,image/jpeg,image/webp"
                        existingUrl={
                            existingImages.ownerPhotoUrl
                        }
                        removed={
                            data.remove_owner_photo
                        }
                        file={data.owner_photo}
                        error={errors.owner_photo}
                        onFileChange={(file) =>
                            setData((current) => ({
                                ...current,
                                owner_photo: file,
                                remove_owner_photo:
                                    false,
                            }))
                        }
                        onRemoveChange={(checked) =>
                            setData(
                                'remove_owner_photo',
                                checked,
                            )
                        }
                    />
                </div>
            </FormSection>

            <FormSection
                title="نمایندگی برندها"
                icon={<Handshake className="size-5" />}
            >
                <AgencyManager
                    agencies={data.agencies}
                    brands={options.brands}
                    statusOptions={options.agency_statuses}
                    errors={errorBag}
                    onChange={(agencies) =>
                        setData('agencies', agencies)
                    }
                />
            </FormSection>

            <FormSection
                title="اطلاعات صنفی و پروانه"
                icon={<FileBadge className="size-5" />}
            >
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        label="کد عضویت صنفی"
                        htmlFor="union_membership_code"
                        error={
                            errors.union_membership_code
                        }
                    >
                        <Input
                            id="union_membership_code"
                            value={
                                data.union_membership_code
                            }
                            onChange={(event) =>
                                setData(
                                    'union_membership_code',
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>

                    <FormField
                        label="شماره پروانه کسب"
                        htmlFor="business_license_number"
                        error={
                            errors.business_license_number
                        }
                    >
                        <Input
                            id="business_license_number"
                            value={
                                data.business_license_number
                            }
                            onChange={(event) =>
                                setData(
                                    'business_license_number',
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>

                    <FormField
                        label="وضعیت پروانه"
                        htmlFor="business_license_status"
                        error={
                            errors.business_license_status
                        }
                        required
                    >
                        <Select
                            value={
                                data.business_license_status
                            }
                            onValueChange={(value) =>
                                setData(
                                    'business_license_status',
                                    value as RepairShopFormData['business_license_status'],
                                )
                            }
                        >
                            <SelectTrigger id="business_license_status">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {options.business_license_statuses.map(
                                    (status) => (
                                        <SelectItem
                                            key={
                                                status.value
                                            }
                                            value={
                                                status.value
                                            }
                                        >
                                            {
                                                status.label
                                            }
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="تاریخ صدور"
                        htmlFor="business_license_issued_at"
                        error={
                            errors.business_license_issued_at
                        }
                    >
                        <Input
                            id="business_license_issued_at"
                            type="date"
                            dir="ltr"
                            value={
                                data.business_license_issued_at
                            }
                            onChange={(event) =>
                                setData(
                                    'business_license_issued_at',
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>

                    <FormField
                        label="تاریخ انقضا"
                        htmlFor="business_license_expires_at"
                        error={
                            errors.business_license_expires_at
                        }
                    >
                        <Input
                            id="business_license_expires_at"
                            type="date"
                            dir="ltr"
                            value={
                                data.business_license_expires_at
                            }
                            onChange={(event) =>
                                setData(
                                    'business_license_expires_at',
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>
                </div>

                <BooleanSetting
                    id="is_union_member"
                    title="عضو رسمی اتحادیه"
                    description="این واحد صنفی عضو رسمی اتحادیه است."
                    checked={data.is_union_member}
                    onCheckedChange={(checked) =>
                        setData(
                            'is_union_member',
                            checked,
                        )
                    }
                />
            </FormSection>

            <FormSection
                title="وضعیت و انتشار"
                icon={<Settings2 className="size-5" />}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                        label="وضعیت تأیید"
                        htmlFor="approval_status"
                        error={
                            errors.approval_status
                        }
                        required
                    >
                        <Select
                            value={
                                data.approval_status
                            }
                            onValueChange={(value) =>
                                setData(
                                    'approval_status',
                                    value as RepairShopFormData['approval_status'],
                                )
                            }
                        >
                            <SelectTrigger id="approval_status">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {options.approval_statuses.map(
                                    (status) => (
                                        <SelectItem
                                            key={
                                                status.value
                                            }
                                            value={
                                                status.value
                                            }
                                        >
                                            {
                                                status.label
                                            }
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="ترتیب نمایش"
                        htmlFor="sort_order"
                        error={errors.sort_order}
                    >
                        <Input
                            id="sort_order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(event) =>
                                setData(
                                    'sort_order',
                                    Number(
                                        event.target
                                            .value || 0,
                                    ),
                                )
                            }
                        />
                    </FormField>

                    <FormField
                        label="تاریخ انتشار"
                        htmlFor="published_at"
                        error={errors.published_at}
                        description="فقط تعمیرگاه تأییدشده قابل انتشار است."
                    >
                        <Input
                            id="published_at"
                            type="datetime-local"
                            dir="ltr"
                            value={data.published_at}
                            onChange={(event) =>
                                setData(
                                    'published_at',
                                    event.target.value,
                                )
                            }
                        />
                    </FormField>
                </div>

                {data.approval_status ===
                    'rejected' && (
                        <FormField
                            label="علت رد"
                            htmlFor="rejection_reason"
                            error={
                                errors.rejection_reason
                            }
                            required
                        >
                            <Textarea
                                id="rejection_reason"
                                rows={4}
                                value={
                                    data.rejection_reason
                                }
                                onChange={(event) =>
                                    setData(
                                        'rejection_reason',
                                        event.target.value,
                                    )
                                }
                            />
                        </FormField>
                    )}

                <div className="grid gap-4 md:grid-cols-3">
                    <BooleanSetting
                        id="is_active"
                        title="فعال"
                        description="تعمیرگاه در سیستم فعال باشد."
                        checked={data.is_active}
                        onCheckedChange={(checked) =>
                            setData(
                                'is_active',
                                checked,
                            )
                        }
                    />

                    <BooleanSetting
                        id="is_verified"
                        title="احراز‌شده"
                        description="هویت و مدارک تعمیرگاه بررسی شده است."
                        checked={data.is_verified}
                        onCheckedChange={(checked) =>
                            setData(
                                'is_verified',
                                checked,
                            )
                        }
                    />

                    <BooleanSetting
                        id="is_featured"
                        title="نمایش ویژه"
                        description="تعمیرگاه در بخش‌های ویژه نمایش داده شود."
                        checked={data.is_featured}
                        onCheckedChange={(checked) =>
                            setData(
                                'is_featured',
                                checked,
                            )
                        }
                    />
                </div>
            </FormSection>

            <Card>
                <CardFooter className="justify-end gap-3 py-5">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                    >
                        <Link href="/admin/repair-shops">
                            انصراف
                        </Link>
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            processing ||
                            options.categories
                                .length === 0
                        }
                    >
                        <Save className="size-4" />

                        {processing
                            ? 'در حال ذخیره...'
                            : mode === 'create'
                                ? 'ایجاد تعمیرگاه'
                                : 'ذخیره تغییرات'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

function FormSection({
                         title,
                         icon,
                         children,
                     }: {
    title: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {children}
            </CardContent>
        </Card>
    );
}

function FormField({
                       label,
                       htmlFor,
                       error,
                       description,
                       required = false,
                       children,
                   }: {
    label: string;
    htmlFor: string;
    error?: string;
    description?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>
                {label}

                {required && (
                    <span className="mr-1 text-destructive">
                        *
                    </span>
                )}
            </Label>

            {children}

            {error ? (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            ) : (
                description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )
            )}
        </div>
    );
}

function BooleanSetting({
                            id,
                            title,
                            description,
                            checked,
                            onCheckedChange,
                        }: {
    id: string;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (
        checked: boolean,
    ) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-5 rounded-lg border p-4">
            <div>
                <Label htmlFor={id}>
                    {title}
                </Label>

                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>

            <Switch
                dir={"ltr"}
                id={id}
                checked={checked}
                onCheckedChange={
                    onCheckedChange
                }
            />
        </div>
    );
}

function ImageFileField({
                            id,
                            label,
                            accept,
                            existingUrl,
                            removed,
                            file,
                            error,
                            onFileChange,
                            onRemoveChange,
                        }: {
    id: string;
    label: string;
    accept: string;
    existingUrl: string | null;
    removed: boolean;
    file: File | null;
    error?: string;
    onFileChange: (
        file: File | null,
    ) => void;
    onRemoveChange: (
        checked: boolean,
    ) => void;
}) {
    return (
        <div className="space-y-3 rounded-lg border p-4">
            <Label htmlFor={id}>{label}</Label>

            {existingUrl && !removed && !file && (
                <div className="flex h-36 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    <img
                        src={existingUrl}
                        alt={label}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            )}

            <Input
                id={id}
                type="file"
                accept={accept}
                onChange={(event) =>
                    onFileChange(
                        event.target.files?.[0] ??
                        null,
                    )
                }
            />

            {file && (
                <p
                    dir="ltr"
                    className="truncate text-xs text-muted-foreground"
                >
                    {file.name}
                </p>
            )}

            {existingUrl && (
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={removed}
                        onCheckedChange={(value) =>
                            onRemoveChange(
                                value === true,
                            )
                        }
                    />

                    حذف تصویر فعلی
                </label>
            )}

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

function normalizeSlug(
    value: string,
): string {
    return value
        .toLowerCase()
        .trimStart()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}
