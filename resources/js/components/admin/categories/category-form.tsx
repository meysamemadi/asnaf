import type { FormEvent, ReactNode } from 'react';
import { Link, useForm } from '@inertiajs/react';

import CategoryIcon from '@/components/admin/categories/category-icon';
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
import { Textarea } from '@/components/ui/textarea';
import IconPicker from '@/components/admin/categories/icon-picker';

import type {
    CategoryFormData,
    CategoryIconOption,
    ParentOption,
} from '@/types/category';

interface CategoryFormProps {
    mode: 'create' | 'edit';
    initialValues: CategoryFormData;
    parentOptions: ParentOption[];
    icons: CategoryIconOption[];
    categoryId?: number;
}

export default function CategoryForm({
                                         mode,
                                         initialValues,
                                         parentOptions,
                                         icons,
                                         categoryId,
                                     }: CategoryFormProps) {
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm<CategoryFormData>(initialValues);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'create') {
            post('/admin/categories', {
                preserveScroll: true,
            });

            return;
        }

        if (!categoryId) {
            return;
        }

        put(`/admin/categories/${categoryId}`, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} noValidate>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {mode === 'create'
                            ? 'اطلاعات دسته‌بندی جدید'
                            : 'ویرایش اطلاعات دسته‌بندی'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-7">
                    <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                            label="نام دسته‌بندی"
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
                                placeholder="برای مثال: حرارتی"
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
                                placeholder="heating"
                                className="text-left"
                            />
                        </FormField>

                        <FormField
                            label="دسته والد"
                            htmlFor="parent_id"
                            error={errors.parent_id}
                        >
                            <Select
                                value={
                                    data.parent_id === null
                                        ? 'root'
                                        : String(data.parent_id)
                                }
                                onValueChange={(value) =>
                                    setData(
                                        'parent_id',
                                        value === 'root'
                                            ? null
                                            : Number(value),
                                    )
                                }
                            >
                                <SelectTrigger id="parent_id">
                                    <SelectValue placeholder="انتخاب دسته والد" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="root">
                                        بدون والد — دسته اصلی
                                    </SelectItem>

                                    {parentOptions.map((parent) => (
                                        <SelectItem
                                            key={parent.id}
                                            value={String(parent.id)}
                                        >
                                            {parent.name}
                                        </SelectItem>
                                    ))}
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
                                max={999999}
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
                        label="آیکون دسته‌بندی"
                        htmlFor="icon"
                        error={errors.icon ?? errors.icon_library}
                        description="انتخاب آیکون اختیاری است."
                    >
                        <IconPicker
                            value={
                                data.icon && data.icon_library
                                    ? {
                                        name: data.icon,
                                        library:
                                            data.icon_library as
                                                | 'lu'
                                                | 'tb'
                                                | 'pi',
                                    }
                                    : null
                            }
                            onChange={(selection) => {
                                if (!selection) {
                                    setData((current) => ({
                                        ...current,
                                        icon: '',
                                        icon_library: '',
                                    }));

                                    return;
                                }

                                setData((current) => ({
                                    ...current,
                                    icon: selection.name,
                                    icon_library: selection.library,
                                }));
                            }}
                            error={errors.icon ?? errors.icon_library}
                        />
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
                            placeholder="توضیحات اختیاری دسته‌بندی..."
                            className="resize-y"
                        />
                    </FormField>

                    <FormField
                        label="وضعیت دسته‌بندی"
                        htmlFor="is_active"
                        error={errors.is_active}
                    >
                        <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
                            <div className="space-y-1">
                                <Label htmlFor="is_active">
                                    دسته‌بندی فعال باشد
                                </Label>

                                <p className="text-sm text-muted-foreground">
                                    دسته‌بندی غیرفعال در API عمومی
                                    نمایش داده نخواهد شد.
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
                        <Link href="/admin/categories">
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
                                ? 'ایجاد دسته‌بندی'
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
