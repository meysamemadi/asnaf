import {
    type FormEvent,
    type ReactNode,
} from 'react';
import {
    Link,
    useForm,
} from '@inertiajs/react';
import {
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
import { Switch } from '@/components/ui/switch';

import type {
    ProvinceFormData,
} from '@/types/province';

interface ProvinceFormProps {
    mode: 'create' | 'edit';

    initialValues: ProvinceFormData;

    provinceId?: number;
}

export default function ProvinceForm({
                                         mode,
                                         initialValues,
                                         provinceId,
                                     }: ProvinceFormProps) {
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm<ProvinceFormData>(
        initialValues,
    );

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        if (mode === 'create') {
            post('/admin/provinces', {
                preserveScroll: true,
            });

            return;
        }

        if (!provinceId) {
            return;
        }

        put(
            `/admin/provinces/${provinceId}`,
            {
                preserveScroll: true,
            },
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

    return (
        <form
            onSubmit={submit}
            noValidate
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle>
                        اطلاعات استان
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            label="نام استان"
                            htmlFor="name"
                            error={errors.name}
                            required
                        >
                            <Input
                                id="name"
                                value={data.name}
                                autoFocus
                                placeholder="برای مثال: گیلان"
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
                                placeholder="gilan"
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
                            label="کد استان"
                            htmlFor="code"
                            error={errors.code}
                        >
                            <Input
                                id="code"
                                dir="ltr"
                                value={data.code}
                                className="text-left"
                                placeholder="01"
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
                                استان فعال
                            </Label>

                            <p className="mt-1 text-xs text-muted-foreground">
                                استان فعال در فرم
                                تعمیرگاه و فهرست‌های عمومی
                                قابل انتخاب خواهد بود.
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
                        مرکز نمایشی نقشه
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
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
                            description="برای استان معمولاً عدد ۷ یا ۸ مناسب است."
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
                                            8,
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
                        label="برای تعیین مرکز نمایشی استان روی نقشه کلیک کنید."
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
                        <Link href="/admin/provinces">
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
                                ? 'ایجاد استان'
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
