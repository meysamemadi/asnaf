import {
    type FormEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Head,
    Link,
    router,
} from '@inertiajs/react';
import {
    Building2,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type {
    PaginatedProvinces,
    ProvinceFilters,
    ProvinceListItem,
    ProvinceStatusFilter,
} from '@/types/province';

interface IndexProvincePageProps {
    provinces: PaginatedProvinces;
    filters: ProvinceFilters;
}

export default function IndexProvincePage({
                                              provinces,
                                              filters,
                                          }: IndexProvincePageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] =
        useState<ProvinceStatusFilter>(
            filters.status ?? 'all',
        );

    const [
        selectedProvince,
        setSelectedProvince,
    ] = useState<ProvinceListItem | null>(
        null,
    );

    const [deleting, setDeleting] =
        useState(false);

    const firstRender = useRef(true);

    const loadProvinces = useCallback(
        (): void => {
            router.get(
                '/admin/provinces',
                {
                    search:
                        search.trim() ||
                        undefined,

                    status:
                        status === 'all'
                            ? undefined
                            : status,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,

                    only: [
                        'provinces',
                        'filters',
                    ],
                },
            );
        },
        [search, status],
    );

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout =
            window.setTimeout(
                loadProvinces,
                450,
            );

        return () => {
            window.clearTimeout(timeout);
        };
    }, [loadProvinces]);

    const submitSearch = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        loadProvinces();
    };

    const clearFilters = (): void => {
        setSearch('');
        setStatus('all');

        router.get(
            '/admin/provinces',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,

                only: [
                    'provinces',
                    'filters',
                ],
            },
        );
    };

    const requestDelete = (
        province: ProvinceListItem,
    ): void => {
        if (
            province.cities_count > 0
        ) {
            return;
        }

        setSelectedProvince(province);
    };

    const confirmDelete = (): void => {
        if (!selectedProvince) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/admin/provinces/${selectedProvince.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedProvince(null);
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    const hasFilters =
        search.trim() !== '' ||
        status !== 'all';

    return (
        <>
            <Head title="مدیریت استان‌ها" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-7xl p-4 md:p-6"
            >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            مدیریت استان‌ها
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            ایجاد، ویرایش و تعیین
                            مرکز نمایشی استان‌ها
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/provinces/create">
                            <Plus className="size-4" />
                            ایجاد استان
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>
                                فهرست استان‌ها
                            </CardTitle>

                            <CardDescription className="mt-2">
                                مجموعاً{' '}
                                {provinces.total}{' '}
                                استان ثبت شده است.
                            </CardDescription>
                        </div>

                        <form
                            onSubmit={submitSearch}
                            className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    value={search}
                                    className="pr-9"
                                    placeholder="جست‌وجو در نام، نامک یا کد استان..."
                                    onChange={(
                                        event,
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            <Select
                                value={status}
                                onValueChange={(
                                    value,
                                ) =>
                                    setStatus(
                                        value as ProvinceStatusFilter,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="وضعیت" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        همه وضعیت‌ها
                                    </SelectItem>

                                    <SelectItem value="active">
                                        فعال
                                    </SelectItem>

                                    <SelectItem value="inactive">
                                        غیرفعال
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    <X className="size-4" />
                                    پاک‌کردن
                                </Button>
                            )}
                        </form>
                    </CardHeader>

                    <CardContent className="p-0">
                        {provinces.data.length ===
                        0 ? (
                            <EmptyState
                                hasFilters={
                                    hasFilters
                                }
                                onClear={
                                    clearFilters
                                }
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[950px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">
                                                    استان
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    کد
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    مرکز نقشه
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    بزرگ‌نمایی
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    شهرها
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    ترتیب
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    وضعیت
                                                </TableHead>

                                                <TableHead className="text-left">
                                                    عملیات
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {provinces.data.map(
                                                (
                                                    province,
                                                ) => (
                                                    <TableRow
                                                        key={
                                                            province.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            <div className="min-w-44">
                                                                <p className="font-medium">
                                                                    {
                                                                        province.name
                                                                    }
                                                                </p>

                                                                <code
                                                                    dir="ltr"
                                                                    className="mt-1 block text-xs text-muted-foreground"
                                                                >
                                                                    {
                                                                        province.slug
                                                                    }
                                                                </code>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <span dir="ltr">
                                                                {province.code ??
                                                                    '—'}
                                                            </span>
                                                        </TableCell>

                                                        <TableCell>
                                                            <ProvinceCoordinates
                                                                province={
                                                                    province
                                                                }
                                                            />
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            {
                                                                province.map_zoom
                                                            }
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <Badge variant="outline">
                                                                {
                                                                    province.cities_count
                                                                }{' '}
                                                                شهر
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            {
                                                                province.sort_order
                                                            }
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant={
                                                                    province.is_active
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {province.is_active
                                                                    ? 'فعال'
                                                                    : 'غیرفعال'}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                    title="ویرایش استان"
                                                                >
                                                                    <Link
                                                                        href={`/admin/provinces/${province.id}/edit`}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                    </Link>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    disabled={
                                                                        province.cities_count >
                                                                        0
                                                                    }
                                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    title={
                                                                        province.cities_count >
                                                                        0
                                                                            ? 'استان دارای شهر است و قابل حذف نیست.'
                                                                            : 'حذف استان'
                                                                    }
                                                                    onClick={() =>
                                                                        requestDelete(
                                                                            province,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <ProvincePagination
                                    provinces={
                                        provinces
                                    }
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <DeleteProvinceDialog
                province={selectedProvince}
                deleting={deleting}
                onClose={() =>
                    setSelectedProvince(null)
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}

function ProvinceCoordinates({
                                 province,
                             }: {
    province: ProvinceListItem;
}) {
    if (
        province.latitude === null ||
        province.longitude === null
    ) {
        return (
            <span className="text-muted-foreground">
                تعیین نشده
            </span>
        );
    }

    return (
        <div className="flex min-w-48 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />

            <code
                dir="ltr"
                className="text-xs"
            >
                {province.latitude},{' '}
                {province.longitude}
            </code>
        </div>
    );
}

function DeleteProvinceDialog({
                                  province,
                                  deleting,
                                  onClose,
                                  onConfirm,
                              }: {
    province: ProvinceListItem | null;
    deleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog
            open={province !== null}
            onOpenChange={(open) => {
                if (!open && !deleting) {
                    onClose();
                }
            }}
        >
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        حذف استان
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        آیا از حذف استان «
                        {province?.name}» مطمئن
                        هستید؟ این عملیات قابل
                        بازگشت نیست.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={deleting}
                    >
                        انصراف
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(event) => {
                            event.preventDefault();

                            onConfirm();
                        }}
                    >
                        {deleting
                            ? 'در حال حذف...'
                            : 'حذف استان'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function ProvincePagination({
                                provinces,
                            }: {
    provinces: PaginatedProvinces;
}) {
    if (provinces.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                نمایش {provinces.from ?? 0} تا{' '}
                {provinces.to ?? 0} از{' '}
                {provinces.total}
            </p>

            <div className="flex flex-wrap gap-1">
                {provinces.links.map(
                    (link, index) => {
                        const label =
                            paginationLabel(
                                link.label,
                            );

                        if (!link.url) {
                            return (
                                <Button
                                    key={`${link.label}-${index}`}
                                    variant="outline"
                                    size="sm"
                                    disabled
                                >
                                    {label}
                                </Button>
                            );
                        }

                        return (
                            <Button
                                key={`${link.label}-${index}`}
                                variant={
                                    link.active
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                asChild
                            >
                                <Link
                                    href={link.url}
                                    preserveState
                                    preserveScroll
                                >
                                    {label}
                                </Link>
                            </Button>
                        );
                    },
                )}
            </div>
        </div>
    );
}

function paginationLabel(
    label: string,
): string {
    if (
        label.includes('Previous') ||
        label.includes('&laquo;')
    ) {
        return 'قبلی';
    }

    if (
        label.includes('Next') ||
        label.includes('&raquo;')
    ) {
        return 'بعدی';
    }

    return label;
}

function EmptyState({
                        hasFilters,
                        onClear,
                    }: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <Building2 className="size-6 text-muted-foreground" />
            </div>

            <h2 className="font-semibold">
                {hasFilters
                    ? 'استانی پیدا نشد'
                    : 'هنوز استانی ثبت نشده است'}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
                {hasFilters
                    ? 'فیلترها یا عبارت جست‌وجو را تغییر دهید.'
                    : 'برای شروع اولین استان را ثبت کنید.'}
            </p>

            {hasFilters ? (
                <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={onClear}
                >
                    پاک‌کردن فیلترها
                </Button>
            ) : (
                <Button
                    className="mt-5"
                    asChild
                >
                    <Link href="/admin/provinces/create">
                        <Plus className="size-4" />
                        ایجاد استان
                    </Link>
                </Button>
            )}
        </div>
    );
}
