import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ImageIcon, Trash2, Upload } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';

import type { BrandFormData } from '@/types/brand';

interface BrandFormProps {
    mode: 'create' | 'edit';
    initialValues: BrandFormData;
    brandId?: number;
    initialLogoUrl?: string | null;
}

export default function BrandForm({
                                      mode,
                                      initialValues,
                                      brandId,
                                      initialLogoUrl = null,
                                  }: BrandFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [temporaryLogoUrl, setTemporaryLogoUrl] =
        useState<string | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        transform,
    } = useForm<BrandFormData>(initialValues);

    useEffect(() => {
        if (!data.logo) {
            setTemporaryLogoUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(data.logo);

        setTemporaryLogoUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [data.logo]);

    const displayedLogoUrl =
        temporaryLogoUrl ??
        (!data.remove_logo ? initialLogoUrl : null);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'create') {
            post('/admin/brands', {
                forceFormData: true,
                preserveScroll: true,
            });

            return;
        }

        if (!brandId) {
            return;
        }

        /*
         * برای آپلود فایل در Laravel، درخواست ویرایش را
         * با POST و method spoofing ارسال می‌کنیم.
         */
        transform((currentData) => ({
            ...currentData,
            _method: 'put',
        }));

        post(`/admin/brands/${brandId}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const selectLogo = (file: File | null) => {
        setData((currentData) => ({
            ...currentData,
            logo: file,
            remove_logo: false,
        }));
    };

    const removeLogo = () => {
        setData((currentData) => ({
            ...currentData,
            logo: null,
            remove_logo: true,
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={submit} noValidate>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {mode === 'create'
                            ? 'اطلاعات برند جدید'
                            : 'ویرایش اطلاعات برند'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-7">
                    <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                            label="نام برند"
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
                                placeholder="برای مثال: سامسونگ"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            label="نامک انگلیسی"
                            htmlFor="slug"
                            error={errors.slug}
                            description="فقط حروف انگلیسی کوچک، عدد و خط تیره"
                        >
                            <Input
                                id="slug"
                                dir="ltr"
                                value={data.slug}
                                onChange={(event) =>
                                    setData(
                                        'slug',
                                        normalizeSlug(
                                            event.target.value,
                                        ),
                                    )
                                }
                                placeholder="samsung"
                                className="text-left"
                            />
                        </FormField>

                        <FormField
                            label="وب‌سایت رسمی"
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

                        <FormField
                            label="ترتیب نمایش"
                            htmlFor="sort_order"
                            error={errors.sort_order}
                        >
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                max={65535}
                                value={data.sort_order}
                                onChange={(event) =>
                                    setData(
                                        'sort_order',
                                        event.target.value === ''
                                            ? 0
                                            : Number(
                                                event.target.value,
                                            ),
                                    )
                                }
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="لوگوی برند"
                        htmlFor="logo"
                        error={errors.logo}
                        description="فرمت‌های PNG، JPG و WebP با حداکثر حجم ۲ مگابایت"
                    >
                        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
                            <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                {displayedLogoUrl ? (
                                    <img
                                        src={displayedLogoUrl}
                                        alt="پیش‌نمایش لوگوی برند"
                                        className="size-full object-contain p-2"
                                    />
                                ) : (
                                    <ImageIcon className="size-9 text-muted-foreground" />
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <Input
                                    ref={fileInputRef}
                                    id="logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(event) =>
                                        selectLogo(
                                            event.target.files?.[0] ??
                                            null,
                                        )
                                    }
                                />

                                {data.logo && (
                                    <p className="text-xs text-muted-foreground">
                                        فایل انتخاب‌شده:{' '}
                                        {data.logo.name}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <Upload className="size-4" />

                                        {displayedLogoUrl
                                            ? 'تغییر لوگو'
                                            : 'انتخاب لوگو'}
                                    </Button>

                                    {displayedLogoUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={removeLogo}
                                        >
                                            <Trash2 className="size-4" />
                                            حذف لوگو
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FormField>

                    <FormField
                        label="توضیحات"
                        htmlFor="description"
                        error={errors.description}
                    >
                        <Textarea
                            id="description"
                            rows={5}
                            value={data.description}
                            onChange={(event) =>
                                setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            placeholder="توضیحات اختیاری درباره برند..."
                            className="resize-y"
                        />
                    </FormField>

                    <FormField
                        label="وضعیت برند"
                        htmlFor="is_active"
                        error={errors.is_active}
                    >
                        <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
                            <div className="space-y-1">
                                <Label htmlFor="is_active">
                                    برند فعال باشد
                                </Label>

                                <p className="text-sm text-muted-foreground">
                                    برند غیرفعال هنگام انتخاب
                                    نمایندگی در فرم تعمیرگاه نمایش
                                    داده نمی‌شود.
                                </p>
                            </div>

                            <Switch
                                dir={"ltr"}
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData(
                                        'is_active',
                                        checked,
                                    )
                                }
                            />
                        </div>
                    </FormField>
                </CardContent>

                <CardFooter className="justify-end gap-3 border-t pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                    >
                        <Link href="/admin/brands">
                            انصراف
                        </Link>
                    </Button>

                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing
                            ? 'در حال ذخیره...'
                            : mode === 'create'
                                ? 'ایجاد برند'
                                : 'ذخیره تغییرات'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    description?: string;
    required?: boolean;
    children: ReactNode;
}

function FormField({
                       label,
                       htmlFor,
                       error,
                       description,
                       required = false,
                       children,
                   }: FormFieldProps) {
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

            {description && !error && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

function normalizeSlug(value: string): string {
    return value
        .toLowerCase()
        .trimStart()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}
