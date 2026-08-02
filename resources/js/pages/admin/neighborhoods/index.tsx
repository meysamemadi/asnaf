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
    LoaderCircle,
    Map,
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
    NeighborhoodCityOption,
    NeighborhoodFilters,
    NeighborhoodListItem,
    NeighborhoodProvinceOption,
    NeighborhoodStatusFilter,
    PaginatedNeighborhoods,
} from '@/types/neighborhood';

interface IndexNeighborhoodPageProps {
    neighborhoods: PaginatedNeighborhoods;

    filters: NeighborhoodFilters;

    provinces: NeighborhoodProvinceOption[];
    cities: NeighborhoodCityOption[];
}

export default function IndexNeighborhoodPage({
                                                  neighborhoods,
                                                  filters,
                                                  provinces,
                                                  cities,
                                              }: IndexNeighborhoodPageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [provinceId, setProvinceId] =
        useState(
            filters.province_id
                ? String(filters.province_id)
                : 'all',
        );

    const [cityId, setCityId] = useState(
        filters.city_id
            ? String(filters.city_id)
            : 'all',
    );

    const [status, setStatus] =
        useState<NeighborhoodStatusFilter>(
            filters.status ?? 'all',
        );

    const [filterCities, setFilterCities] =
        useState<NeighborhoodCityOption[]>(
            cities,
        );

    const [
        loadingFilterCities,
        setLoadingFilterCities,
    ] = useState(false);

    const [
        selectedNeighborhood,
        setSelectedNeighborhood,
    ] = useState<NeighborhoodListItem | null>(
        null,
    );

    const [deleting, setDeleting] =
        useState(false);

    const initialRender = useRef(true);

    const loadNeighborhoods =
        useCallback((): void => {
            router.get(
                '/admin/neighborhoods',
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

                    city_id:
                        cityId === 'all'
                            ? undefined
                            : Number(cityId),

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
                        'neighborhoods',
                        'filters',
                    ],
                },
            );
        }, [
            search,
            provinceId,
            cityId,
            status,
        ]);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const timeout =
            window.setTimeout(
                loadNeighborhoods,
                450,
            );

        return () => {
            window.clearTimeout(timeout);
        };
    }, [loadNeighborhoods]);

    const changeProvinceFilter =
        async (
            value: string,
        ): Promise<void> => {
            setProvinceId(value);
            setCityId('all');

            if (value === 'all') {
                setFilterCities([]);
                return;
            }

            const nextProvinceId =
                Number(value);

            setLoadingFilterCities(true);
            setFilterCities([]);

            try {
                const response = await fetch(
                    `/admin/location-options/provinces/${nextProvinceId}/cities`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        'دریافت شهرها با خطا مواجه شد.',
                    );
                }

                const result =
                    (await response.json()) as {
                        data: NeighborhoodCityOption[];
                    };

                setFilterCities(
                    result.data,
                );
            } catch (error) {
                console.error(
                    'Loading filter cities failed:',
                    error,
                );

                setFilterCities([]);
            } finally {
                setLoadingFilterCities(
                    false,
                );
            }
        };

    const clearFilters = (): void => {
        setSearch('');
        setProvinceId('all');
        setCityId('all');
        setStatus('all');
        setFilterCities([]);
    };

    const requestDelete = (
        neighborhood:
        NeighborhoodListItem,
    ): void => {
        if (
            neighborhood.repair_shops_count >
            0
        ) {
            return;
        }

        setSelectedNeighborhood(
            neighborhood,
        );
    };

    const confirmDelete = (): void => {
        if (!selectedNeighborhood) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/admin/neighborhoods/${selectedNeighborhood.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedNeighborhood(
                        null,
                    );
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
        cityId !== 'all' ||
        status !== 'all';

    return (
        <>
            <Head title="مدیریت محله‌ها" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-[1500px] p-4 md:p-6"
            >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            مدیریت محله‌ها
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            مدیریت محله‌ها، شهر
                            والد و مرکز نمایشی نقشه
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/neighborhoods/create">
                            <Plus className="size-4" />
                            ایجاد محله
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
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    value={search}
                                    className="pr-9"
                                    placeholder="نام یا نامک محله..."
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
                                    changeProvinceFilter
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
                                value={cityId}
                                onValueChange={
                                    setCityId
                                }
                                disabled={
                                    provinceId ===
                                    'all' ||
                                    loadingFilterCities
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            loadingFilterCities
                                                ? 'در حال دریافت شهرها...'
                                                : 'شهر'
                                        }
                                    />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        همه شهرها
                                    </SelectItem>

                                    {filterCities.map(
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
                                        value as NeighborhoodStatusFilter,
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

                        {loadingFilterCities && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <LoaderCircle className="size-3.5 animate-spin" />
                                در حال دریافت
                                شهرهای استان...
                            </div>
                        )}

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
                            فهرست محله‌ها
                        </CardTitle>

                        <CardDescription>
                            مجموعاً{' '}
                            {neighborhoods.total}{' '}
                            محله ثبت شده است.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {neighborhoods.data
                            .length === 0 ? (
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
                                    <Table className="min-w-[1100px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">
                                                    محله
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    شهر و استان
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    مرکز نقشه
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
                                            {neighborhoods.data.map(
                                                (
                                                    neighborhood,
                                                ) => (
                                                    <TableRow
                                                        key={
                                                            neighborhood.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            <div className="min-w-44">
                                                                <p className="font-medium">
                                                                    {
                                                                        neighborhood.name
                                                                    }
                                                                </p>

                                                                <code
                                                                    dir="ltr"
                                                                    className="mt-1 block text-xs text-muted-foreground"
                                                                >
                                                                    {
                                                                        neighborhood.slug
                                                                    }
                                                                </code>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <NeighborhoodLocation
                                                                neighborhood={
                                                                    neighborhood
                                                                }
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <NeighborhoodCoordinates
                                                                neighborhood={
                                                                    neighborhood
                                                                }
                                                            />
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <Badge variant="outline">
                                                                {
                                                                    neighborhood.repair_shops_count
                                                                }{' '}
                                                                تعمیرگاه
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            {
                                                                neighborhood.sort_order
                                                            }
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant={
                                                                    neighborhood.is_active
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {neighborhood.is_active
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
                                                                    title="ویرایش محله"
                                                                >
                                                                    <Link
                                                                        href={`/admin/neighborhoods/${neighborhood.id}/edit`}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                    </Link>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    disabled={
                                                                        neighborhood.repair_shops_count >
                                                                        0
                                                                    }
                                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    title={
                                                                        neighborhood.repair_shops_count >
                                                                        0
                                                                            ? 'محله دارای تعمیرگاه است.'
                                                                            : 'حذف محله'
                                                                    }
                                                                    onClick={() =>
                                                                        requestDelete(
                                                                            neighborhood,
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

                                <NeighborhoodPagination
                                    neighborhoods={
                                        neighborhoods
                                    }
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <DeleteNeighborhoodDialog
                neighborhood={
                    selectedNeighborhood
                }
                deleting={deleting}
                onClose={() =>
                    setSelectedNeighborhood(
                        null,
                    )
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}

function NeighborhoodLocation({
                                  neighborhood,
                              }: {
    neighborhood: NeighborhoodListItem;
}) {
    if (!neighborhood.city) {
        return (
            <span className="text-muted-foreground">
                —
            </span>
        );
    }

    return (
        <div className="space-y-1">
            <p>
                {neighborhood.city.name}
            </p>

            {neighborhood.city.province && (
                <p className="text-xs text-muted-foreground">
                    {
                        neighborhood.city
                            .province.name
                    }
                </p>
            )}

            {(!neighborhood.city.is_active ||
                neighborhood.city.province
                    ?.is_active === false) && (
                <Badge variant="secondary">
                    والد غیرفعال
                </Badge>
            )}
        </div>
    );
}

function NeighborhoodCoordinates({
                                     neighborhood,
                                 }: {
    neighborhood: NeighborhoodListItem;
}) {
    if (
        neighborhood.latitude === null ||
        neighborhood.longitude === null
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
                {neighborhood.latitude},{' '}
                {neighborhood.longitude}
            </code>
        </div>
    );
}

function DeleteNeighborhoodDialog({
                                      neighborhood,
                                      deleting,
                                      onClose,
                                      onConfirm,
                                  }: {
    neighborhood:
        | NeighborhoodListItem
        | null;

    deleting: boolean;

    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog
            open={neighborhood !== null}
            onOpenChange={(open) => {
                if (!open && !deleting) {
                    onClose();
                }
            }}
        >
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        حذف محله
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        آیا از حذف محله «
                        {neighborhood?.name}»
                        مطمئن هستید؟ این عملیات
                        قابل بازگشت نیست.
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
                            : 'حذف محله'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function NeighborhoodPagination({
                                    neighborhoods,
                                }: {
    neighborhoods:
        PaginatedNeighborhoods;
}) {
    if (
        neighborhoods.last_page <= 1
    ) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                نمایش{' '}
                {neighborhoods.from ?? 0} تا{' '}
                {neighborhoods.to ?? 0} از{' '}
                {neighborhoods.total}
            </p>

            <div className="flex flex-wrap gap-1">
                {neighborhoods.links.map(
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
                <Map className="size-6 text-muted-foreground" />
            </div>

            <h2 className="font-semibold">
                {hasFilters
                    ? 'محله‌ای پیدا نشد'
                    : 'هنوز محله‌ای ثبت نشده است'}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
                {hasFilters
                    ? 'فیلترها یا عبارت جست‌وجو را تغییر دهید.'
                    : 'برای شروع اولین محله را ثبت کنید.'}
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
                    <Link href="/admin/neighborhoods/create">
                        <Plus className="size-4" />
                        ایجاد محله
                    </Link>
                </Button>
            )}
        </div>
    );
}
