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
    CityFormData,
    CityProvinceOption,
} from '@/types/city';

interface CityFormProps {
    mode: 'create' | 'edit';

    initialValues: CityFormData;

    provinces: CityProvinceOption[];

    cityId?: number;
}

interface MapView {
    latitude: number;
    longitude: number;
    zoom: number;
}

export default function CityForm({
                                     mode,
                                     initialValues,
                                     provinces,
                                     cityId,
                                 }: CityFormProps) {
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm<CityFormData>(
        initialValues,
    );

    const [mapView, setMapView] =
        useState<MapView | null>(() => {
            const hasCityCenter =
                initialValues.latitude.trim() !==
                '' &&
                initialValues.longitude.trim() !==
                '';

            if (hasCityCenter) {
                return null;
            }

            const province =
                provinces.find(
                    (item) =>
                        item.id ===
                        initialValues.province_id,
                );

            return toMapView(province);
        });

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        if (mode === 'create') {
            post('/admin/cities', {
                preserveScroll: true,
            });

            return;
        }

        if (!cityId) {
            return;
        }

        put(
            `/admin/cities/${cityId}`,
            {
                preserveScroll: true,
            },
        );
    };

    const changeProvince = (
        value: string,
    ): void => {
        const provinceId = Number(value);

        setData(
            'province_id',
            provinceId,
        );

        const province =
            provinces.find(
                (item) =>
                    item.id === provinceId,
            );

        setMapView(
            toMapView(province),
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

    return (
        <form
            onSubmit={submit}
            noValidate
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="size-5" />
                        اطلاعات شهر
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
                            label="نام شهر"
                            htmlFor="name"
                            error={errors.name}
                            required
                        >
                            <Input
                                id="name"
                                value={data.name}
                                autoFocus
                                placeholder="برای مثال: رشت"
                                onChange={(event) =>
                                    setData(
                                        'name',
                                        event.target
                                            .value,
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
                                placeholder="rasht"
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
                            label="کد شهر"
                            htmlFor="code"
                            error={errors.code}
                        >
                            <Input
                                id="code"
                                dir="ltr"
                                value={data.code}
                                className="text-left"
                                placeholder="013"
                                onChange={(event) =>
                                    setData(
                                        'code',
                                        event.target
                                            .value,
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
                                شهر فعال
                            </Label>

                            <p className="mt-1 text-xs text-muted-foreground">
                                شهر فعال در فرم تعمیرگاه
                                و فهرست‌های عمومی قابل
                                انتخاب خواهد بود.
                            </p>
                        </div>

                        <Switch
                            dir="ltr"
                            id="is_active"
                            checked={
                                data.is_active
                            }
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
                        مرکز نمایشی شهر
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {!data.province_id && (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            ابتدا استان شهر را انتخاب
                            کنید تا نقشه روی مرکز آن
                            استان قرار بگیرد.
                        </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-3">
                        <FormField
                            label="عرض جغرافیایی"
                            htmlFor="latitude"
                            error={
                                errors.latitude
                            }
                        >
                            <Input
                                id="latitude"
                                type="number"
                                step="0.0000001"
                                min={-90}
                                max={90}
                                dir="ltr"
                                value={
                                    data.latitude
                                }
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
                                value={
                                    data.longitude
                                }
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
                            error={
                                errors.map_zoom
                            }
                            required
                            description="برای شهر معمولاً عدد ۱۱ تا ۱۳ مناسب است."
                        >
                            <Input
                                id="map_zoom"
                                type="number"
                                min={4}
                                max={18}
                                value={
                                    data.map_zoom
                                }
                                onChange={(event) =>
                                    setData(
                                        'map_zoom',
                                        Number(
                                            event.target
                                                .value ||
                                            12,
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
                        label="برای تعیین مرکز شهر روی نقشه کلیک کنید."
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

                            const province =
                                provinces.find(
                                    (item) =>
                                        item.id ===
                                        data.province_id,
                                );

                            setMapView(
                                toMapView(
                                    province,
                                ),
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
                        <Link href="/admin/cities">
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
                                ? 'ایجاد شهر'
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
    province:
        | CityProvinceOption
        | null
        | undefined,
): MapView | null {
    if (
        province?.latitude === null ||
        province?.latitude === undefined ||
        province.longitude === null ||
        province.longitude === undefined
    ) {
        return null;
    }

    return {
        latitude: province.latitude,
        longitude: province.longitude,
        zoom: province.map_zoom,
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
