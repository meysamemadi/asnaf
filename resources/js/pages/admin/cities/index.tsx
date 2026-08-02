import {
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
    CityFilters,
    CityListItem,
    CityProvinceOption,
    CityStatusFilter,
    PaginatedCities,
} from '@/types/city';

interface IndexCityPageProps {
    cities: PaginatedCities;
    filters: CityFilters;
    provinces: CityProvinceOption[];
}

export default function IndexCityPage({
                                          cities,
                                          filters,
                                          provinces,
                                      }: IndexCityPageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [provinceId, setProvinceId] =
        useState(
            filters.province_id
                ? String(filters.province_id)
                : 'all',
        );

    const [status, setStatus] =
        useState<CityStatusFilter>(
            filters.status ?? 'all',
        );

    const [selectedCity, setSelectedCity] =
        useState<CityListItem | null>(null);

    const [deleting, setDeleting] =
        useState(false);

    const initialRender = useRef(true);

    const loadCities = useCallback(
        (): void => {
            router.get(
                '/admin/cities',
                {
                    search:
                        search.trim() ||
                        undefined,

                    province_id:
                        provinceId === 'all'
                            ? undefined
                            : Number(
                                provinceId,
                            ),

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
                        'cities',
                        'filters',
                    ],
                },
            );
        },
        [
            search,
            provinceId,
            status,
        ],
    );

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const timeout =
            window.setTimeout(
                loadCities,
                450,
            );

        return () => {
            window.clearTimeout(timeout);
        };
    }, [loadCities]);

    const clearFilters = (): void => {
        setSearch('');
        setProvinceId('all');
        setStatus('all');

        router.get(
            '/admin/cities',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,

                only: [
                    'cities',
                    'filters',
                ],
            },
        );
    };

    const requestDelete = (
        city: CityListItem,
    ): void => {
        if (
            city.neighborhoods_count > 0 ||
            city.repair_shops_count > 0
        ) {
            return;
        }

        setSelectedCity(city);
    };

    const confirmDelete = (): void => {
        if (!selectedCity) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/admin/cities/${selectedCity.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedCity(null);
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    const hasFilters =
        search.trim() !== '' ||
        provinceId !== 'all' ||
        status !== 'all';

    return (
        <>
            <Head title="مدیریت شهرها" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-[1500px] p-4 md:p-6"
            >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            مدیریت شهرها
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            مدیریت شهرها، استان والد
                            و مرکز نمایشی نقشه
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/cities/create">
                            <Plus className="size-4" />
                            ایجاد شهر
                        </Link>
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base">
                            جست‌وجو و فیلتر
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    value={search}
                                    className="pr-9"
                                    placeholder="نام، نامک یا کد شهر..."
                                    onChange={(event) =>
                                        setSearch(
                                            event.target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            <Select
                                value={provinceId}
                                onValueChange={
                                    setProvinceId
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="استان" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        همه استان‌ها
                                    </SelectItem>

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
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>

                            <Select
                                value={status}
                                onValueChange={(
                                    value,
                                ) =>
                                    setStatus(
                                        value as CityStatusFilter,
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
                        </div>

                        {hasFilters && (
                            <div className="mt-4 flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    <X className="size-4" />
                                    پاک‌کردن فیلترها
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            فهرست شهرها
                        </CardTitle>

                        <CardDescription>
                            مجموعاً {cities.total}{' '}
                            شهر ثبت شده است.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {cities.data.length === 0 ? (
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
                                    <Table className="min-w-[1200px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">
                                                    شهر
                                                </TableHead>

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
                                                    محله‌ها
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    تعمیرگاه‌ها
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
                                            {cities.data.map(
                                                (city) => {
                                                    const cannotDelete =
                                                        city.neighborhoods_count >
                                                        0 ||
                                                        city.repair_shops_count >
                                                        0;

                                                    return (
                                                        <TableRow
                                                            key={
                                                                city.id
                                                            }
                                                        >
                                                            <TableCell>
                                                                <div className="min-w-44">
                                                                    <p className="font-medium">
                                                                        {
                                                                            city.name
                                                                        }
                                                                    </p>

                                                                    <code
                                                                        dir="ltr"
                                                                        className="mt-1 block text-xs text-muted-foreground"
                                                                    >
                                                                        {
                                                                            city.slug
                                                                        }
                                                                    </code>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell>
                                                                {city.province ? (
                                                                    <div className="space-y-1">
                                                                        <span>
                                                                            {
                                                                                city
                                                                                    .province
                                                                                    .name
                                                                            }
                                                                        </span>

                                                                        {!city
                                                                            .province
                                                                            .is_active && (
                                                                            <Badge variant="secondary">
                                                                                استان
                                                                                غیرفعال
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </TableCell>

                                                            <TableCell>
                                                                <span dir="ltr">
                                                                    {city.code ??
                                                                        '—'}
                                                                </span>
                                                            </TableCell>

                                                            <TableCell>
                                                                <CityCoordinates
                                                                    city={
                                                                        city
                                                                    }
                                                                />
                                                            </TableCell>

                                                            <TableCell className="text-center">
                                                                <Badge variant="outline">
                                                                    {
                                                                        city.neighborhoods_count
                                                                    }{' '}
                                                                    محله
                                                                </Badge>
                                                            </TableCell>

                                                            <TableCell className="text-center">
                                                                <Badge variant="outline">
                                                                    {
                                                                        city.repair_shops_count
                                                                    }{' '}
                                                                    تعمیرگاه
                                                                </Badge>
                                                            </TableCell>

                                                            <TableCell className="text-center">
                                                                {
                                                                    city.sort_order
                                                                }
                                                            </TableCell>

                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={
                                                                        city.is_active
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {city.is_active
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
                                                                        title="ویرایش شهر"
                                                                    >
                                                                        <Link
                                                                            href={`/admin/cities/${city.id}/edit`}
                                                                        >
                                                                            <Pencil className="size-4" />
                                                                        </Link>
                                                                    </Button>

                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        disabled={
                                                                            cannotDelete
                                                                        }
                                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        title={
                                                                            cannotDelete
                                                                                ? 'شهر دارای محله یا تعمیرگاه است.'
                                                                                : 'حذف شهر'
                                                                        }
                                                                        onClick={() =>
                                                                            requestDelete(
                                                                                city,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                },
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <CityPagination
                                    cities={cities}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <DeleteCityDialog
                city={selectedCity}
                deleting={deleting}
                onClose={() =>
                    setSelectedCity(null)
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}

function CityCoordinates({
                             city,
                         }: {
    city: CityListItem;
}) {
    if (
        city.latitude === null ||
        city.longitude === null
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
                {city.latitude},{' '}
                {city.longitude}
            </code>
        </div>
    );
}

function DeleteCityDialog({
                              city,
                              deleting,
                              onClose,
                              onConfirm,
                          }: {
    city: CityListItem | null;
    deleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog
            open={city !== null}
            onOpenChange={(open) => {
                if (!open && !deleting) {
                    onClose();
                }
            }}
        >
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        حذف شهر
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        آیا از حذف شهر «
                        {city?.name}» مطمئن هستید؟
                        این عملیات قابل بازگشت نیست.
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
                            : 'حذف شهر'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function CityPagination({
                            cities,
                        }: {
    cities: PaginatedCities;
}) {
    if (cities.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                نمایش {cities.from ?? 0} تا{' '}
                {cities.to ?? 0} از{' '}
                {cities.total}
            </p>

            <div className="flex flex-wrap gap-1">
                {cities.links.map(
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
                    ? 'شهری پیدا نشد'
                    : 'هنوز شهری ثبت نشده است'}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
                {hasFilters
                    ? 'فیلترها یا عبارت جست‌وجو را تغییر دهید.'
                    : 'برای شروع اولین شهر را ثبت کنید.'}
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
                    <Link href="/admin/cities/create">
                        <Plus className="size-4" />
                        ایجاد شهر
                    </Link>
                </Button>
            )}
        </div>
    );
}
