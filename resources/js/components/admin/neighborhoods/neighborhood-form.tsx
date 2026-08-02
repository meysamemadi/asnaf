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
    LoaderCircle,
    MapPinned,
    Save,
} from 'lucide-react';

import MapCenterPicker from '@/components/admin/locations/map-center-picker';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

import type {
    NeighborhoodCityOption,
    NeighborhoodFormData,
    NeighborhoodProvinceOption,
} from '@/types/neighborhood';

interface NeighborhoodFormProps {
    mode: 'create' | 'edit';

    initialValues: NeighborhoodFormData;

    provinces: NeighborhoodProvinceOption[];
    initialCities: NeighborhoodCityOption[];

    neighborhoodId?: number;
}

interface MapView {
    latitude: number;
    longitude: number;
    zoom: number;
}

export default function NeighborhoodForm({
                                             mode,
                                             initialValues,
                                             provinces,
                                             initialCities,
                                             neighborhoodId,
                                         }: NeighborhoodFormProps) {
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm<NeighborhoodFormData>(
        initialValues,
    );

    const [cities, setCities] =
        useState<NeighborhoodCityOption[]>(
            initialCities,
        );

    const [loadingCities, setLoadingCities] =
        useState(false);

    const [mapView, setMapView] =
        useState<MapView | null>(() => {
            const hasNeighborhoodCenter =
                initialValues.latitude.trim() !==
                '' &&
                initialValues.longitude.trim() !==
                '';

            /*
             * در صفحه ویرایش اگر محله مختصات دارد،
             * Marker ذخیره‌شده مرکز نقشه را تعیین می‌کند.
             */
            if (hasNeighborhoodCenter) {
                return null;
            }

            const city = initialCities.find(
                (item) =>
                    item.id ===
                    initialValues.city_id,
            );

            return toMapView(city);
        });

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        if (mode === 'create') {
            post('/admin/neighborhoods', {
                preserveScroll: true,
            });

            return;
        }

        if (!neighborhoodId) {
            return;
        }

        put(
            `/admin/neighborhoods/${neighborhoodId}`,
            {
                preserveScroll: true,
            },
        );
    };

    const changeProvince = async (
        value: string,
    ): Promise<void> => {
        const provinceId = Number(value);

        const province = provinces.find(
            (item) =>
                item.id === provinceId,
        );

        setMapView(
            toMapView(province),
        );

        setData((current) => ({
            ...current,

            province_id: provinceId,
            city_id: null,
        }));

        setCities([]);
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
                    data: NeighborhoodCityOption[];
                };

            setCities(result.data);
        } catch (error) {
            console.error(
                'Loading neighborhood cities failed:',
                error,
            );

            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };

    const changeCity = (
        value: string,
    ): void => {
        const cityId = Number(value);

        setData(
            'city_id',
            cityId,
        );

        const city = cities.find(
            (item) =>
                item.id === cityId,
        );

        setMapView(
            toMapView(city),
        );
    };

    const latitude =
        parseNullableNumber(
            data.latitude,
        );

    const longitude =
        parseNullableNumber(
            data.longitude,
        );

    const selectedProvince =
        provinces.find(
            (province) =>
                province.id ===
                data.province_id,
        );

    const selectedCity =
        cities.find(
            (city) =>
                city.id === data.city_id,
        );

    return (
        <form
            onSubmit={submit}
            noValidate
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle>
                        اطلاعات محله
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            label="استان"
                            htmlFor="province_id"
                            error={
                                errors.province_id
                            }
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
                                    <SelectValue placeholder="استان را انتخاب کنید" />
                                </SelectTrigger>

                                <SelectContent>
                                    {provinces.map(
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

                                                {!province.is_active &&
                                                    ' — غیرفعال'}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>

                            {selectedProvince &&
                                !selectedProvince.is_active && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        استان انتخاب‌شده
                                        غیرفعال است.
                                    </p>
                                )}
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
                                onValueChange={
                                    changeCity
                                }
                                disabled={
                                    !data.province_id ||
                                    loadingCities
                                }
                            >
                                <SelectTrigger id="city_id">
                                    <SelectValue
                                        placeholder={
                                            loadingCities
                                                ? 'در حال دریافت شهرها...'
                                                : data.province_id
                                                    ? 'شهر را انتخاب کنید'
                                                    : 'ابتدا استان را انتخاب کنید'
                                        }
                                    />
                                </SelectTrigger>

                                <SelectContent>
                                    {cities.map(
                                        (city) => (
                                            <SelectItem
                                                key={
                                                    city.id
                                                }
                                                value={String(
                                                    city.id,
                                                )}
                                            >
                                                {
                                                    city.name
                                                }

                                                {!city.is_active &&
                                                    ' — غیرفعال'}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>

                            {loadingCities && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                    در حال دریافت
                                    شهرها...
                                </div>
                            )}

                            {selectedCity &&
                                !selectedCity.is_active && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        شهر انتخاب‌شده
                                        غیرفعال است.
                                    </p>
                                )}
                        </FormField>

                        <FormField
                            label="نام محله"
                            htmlFor="name"
                            error={errors.name}
                            required
                        >
                            <Input
                                id="name"
                                value={data.name}
                                autoFocus
                                placeholder="برای مثال: گلسار"
                                onChange={(event) =>
                                    setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
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
                                className="text-left"
                                placeholder="golsar"
                                onChange={(event) =>
                                    setData(
                                        'slug',
                                        normalizeSlug(
                                            event.target
                                                .value,
                                        ),
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="ترتیب نمایش"
                            htmlFor="sort_order"
                            error={
                                errors.sort_order
                            }
                        >
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                max={65535}
                                value={
                                    data.sort_order
                                }
                                onChange={(event) =>
                                    setData(
                                        'sort_order',
                                        Number(
                                            event.target
                                                .value ||
                                            0,
                                        ),
                                    )
                                }
                            />
                        </FormField>
                    </div>

                    <div className="flex items-center justify-between gap-5 rounded-lg border p-4">
                        <div>
                            <Label htmlFor="is_active">
                                محله فعال
                            </Label>

                            <p className="mt-1 text-xs text-muted-foreground">
                                محله فعال در فرم
                                تعمیرگاه قابل انتخاب
                                خواهد بود.
                            </p>
                        </div>

                        <Switch
                            dir="ltr"
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(
                                checked,
                            ) =>
                                setData(
                                    'is_active',
                                    checked,
                                )
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPinned className="size-5" />
                        مرکز نمایشی محله
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {!data.city_id && (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            ابتدا استان و سپس شهر را
                            انتخاب کنید تا نقشه روی
                            مرکز شهر قرار بگیرد.
                        </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-3">
                        <FormField
                            label="عرض جغرافیایی"
                            htmlFor="latitude"
                            error={errors.latitude}
                        >
                            <Input
                                id="latitude"
                                type="number"
                                step="0.0000001"
                                min={-90}
                                max={90}
                                dir="ltr"
                                value={data.latitude}
                                className="text-left"
                                onChange={(event) =>
                                    setData(
                                        'latitude',
                                        event.target
                                            .value,
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="طول جغرافیایی"
                            htmlFor="longitude"
                            error={
                                errors.longitude
                            }
                        >
                            <Input
                                id="longitude"
                                type="number"
                                step="0.0000001"
                                min={-180}
                                max={180}
                                dir="ltr"
                                value={data.longitude}
                                className="text-left"
                                onChange={(event) =>
                                    setData(
                                        'longitude',
                                        event.target
                                            .value,
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="بزرگ‌نمایی نقشه"
                            htmlFor="map_zoom"
                            error={errors.map_zoom}
                            required
                            description="برای محله معمولاً عدد ۱۴ تا ۱۷ مناسب است."
                        >
                            <Input
                                id="map_zoom"
                                type="number"
                                min={4}
                                max={19}
                                value={data.map_zoom}
                                onChange={(event) =>
                                    setData(
                                        'map_zoom',
                                        Number(
                                            event.target
                                                .value ||
                                            15,
                                        ),
                                    )
                                }
                            />
                        </FormField>
                    </div>

                    <MapCenterPicker
                        latitude={latitude}
                        longitude={longitude}
                        zoom={data.map_zoom}
                        viewLatitude={
                            mapView?.latitude ??
                            null
                        }
                        viewLongitude={
                            mapView?.longitude ??
                            null
                        }
                        viewZoom={
                            mapView?.zoom ?? null
                        }
                        label="برای تعیین مرکز محله روی نقشه کلیک کنید."
                        onChange={(
                            nextLatitude,
                            nextLongitude,
                        ) => {
                            setData((current) => ({
                                ...current,

                                latitude:
                                    String(
                                        nextLatitude,
                                    ),

                                longitude:
                                    String(
                                        nextLongitude,
                                    ),
                            }));
                        }}
                        onClear={() => {
                            setData((current) => ({
                                ...current,
                                latitude: '',
                                longitude: '',
                            }));

                            const city =
                                cities.find(
                                    (item) =>
                                        item.id ===
                                        data.city_id,
                                );

                            setMapView(
                                toMapView(city),
                            );
                        }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardFooter className="justify-end gap-3 py-5">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                    >
                        <Link href="/admin/neighborhoods">
                            انصراف
                        </Link>
                    </Button>

                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        <Save className="size-4" />

                        {processing
                            ? 'در حال ذخیره...'
                            : mode === 'create'
                                ? 'ایجاد محله'
                                : 'ذخیره تغییرات'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
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

function toMapView(
    location:
        | {
        latitude: number | null;
        longitude: number | null;
        map_zoom: number;
    }
        | null
        | undefined,
): MapView | null {
    if (
        location?.latitude === null ||
        location?.latitude === undefined ||
        location.longitude === null ||
        location.longitude === undefined
    ) {
        return null;
    }

    return {
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: location.map_zoom,
    };
}

function parseNullableNumber(
    value: string,
): number | null {
    if (value.trim() === '') {
        return null;
    }

    const result = Number(value);

    return Number.isFinite(result)
        ? result
        : null;
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
