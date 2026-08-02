import {
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ExternalLink,
    ImageIcon,
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
import AppLayout from '@/layouts/app-layout';

import type {
    Brand,
    PaginatedBrands,
} from '@/types/brand';

interface IndexBrandPageProps {
    brands: PaginatedBrands;

    filters: {
        search: string;
        status: 'all' | 'active' | 'inactive';
    };
}

export default function IndexBrandPage({
                                           brands,
                                           filters,
                                       }: IndexBrandPageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState<
        'all' | 'active' | 'inactive'
    >(filters.status ?? 'all');

    const [selectedBrand, setSelectedBrand] =
        useState<Brand | null>(null);

    const [deleting, setDeleting] = useState(false);

    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            loadBrands(search, status);
        }, 500);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [search]);

    const loadBrands = (
        searchValue: string,
        statusValue: string,
    ) => {
        router.get(
            '/admin/brands',
            {
                search: searchValue.trim() || undefined,

                status:
                    statusValue === 'all'
                        ? undefined
                        : statusValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['brands', 'filters'],
            },
        );
    };

    const submitSearch = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        loadBrands(search, status);
    };

    const changeStatus = (
        value: 'all' | 'active' | 'inactive',
    ) => {
        setStatus(value);
        loadBrands(search, value);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');

        router.get(
            '/admin/brands',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['brands', 'filters'],
            },
        );
    };

    const confirmDelete = () => {
        if (!selectedBrand) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/admin/brands/${selectedBrand.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedBrand(null);
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    const hasFilters =
        search.trim() !== '' || status !== 'all';

    return (
        <>
            <Head title="مدیریت برندها" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-7xl p-4 md:p-6"
            >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            مدیریت برندها
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            مدیریت برندهای قابل انتخاب برای
                            نمایندگی تعمیرگاه‌ها
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/brands/create">
                            <Plus className="size-4" />
                            ایجاد برند
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>فهرست برندها</CardTitle>

                            <CardDescription className="mt-2">
                                مجموعاً {brands.total} برند ثبت
                                شده است.
                            </CardDescription>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <form
                                onSubmit={submitSearch}
                                className="relative flex-1"
                            >
                                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    className="pr-9"
                                    placeholder="جست‌وجو در نام، نامک یا توضیحات..."
                                />
                            </form>

                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    changeStatus(
                                        value as
                                            | 'all'
                                            | 'active'
                                            | 'inactive',
                                    )
                                }
                            >
                                <SelectTrigger className="w-full md:w-48">
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
                                    onClick={clearFilters}
                                >
                                    <X className="size-4" />
                                    پاک‌کردن فیلترها
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {brands.data.length === 0 ? (
                            <EmptyState
                                hasFilters={hasFilters}
                                onClear={clearFilters}
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[850px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">
                                                    برند
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    نامک
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    وب‌سایت
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
                                            {brands.data.map(
                                                (brand) => (
                                                    <TableRow
                                                        key={
                                                            brand.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                                    {brand.logo_url ? (
                                                                        <img
                                                                            src={
                                                                                brand.logo_url
                                                                            }
                                                                            alt={`لوگوی ${brand.name}`}
                                                                            className="size-full object-contain p-1.5"
                                                                        />
                                                                    ) : (
                                                                        <ImageIcon className="size-5 text-muted-foreground" />
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <p className="font-medium">
                                                                        {
                                                                            brand.name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        شناسه:{' '}
                                                                        {
                                                                            brand.id
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <code
                                                                dir="ltr"
                                                                className="rounded bg-muted px-2 py-1 text-xs"
                                                            >
                                                                {
                                                                    brand.slug
                                                                }
                                                            </code>
                                                        </TableCell>

                                                        <TableCell>
                                                            {brand.website ? (
                                                                <a
                                                                    href={
                                                                        brand.website
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                                                >
                                                                    مشاهده

                                                                    <ExternalLink className="size-3.5" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            {
                                                                brand.sort_order
                                                            }
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <BrandStatusBadge
                                                                active={
                                                                    brand.is_active
                                                                }
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                    title="ویرایش"
                                                                >
                                                                    <Link
                                                                        href={`/admin/brands/${brand.id}/edit`}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                    </Link>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    title="حذف"
                                                                    onClick={() =>
                                                                        setSelectedBrand(
                                                                            brand,
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

                                <BrandPagination brands={brands} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <AlertDialog
                open={selectedBrand !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedBrand(null);
                    }
                }}
            >
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            حذف برند
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            آیا از حذف برند «
                            {selectedBrand?.name}» مطمئن هستید؟
                            برند به‌صورت آرشیوی حذف می‌شود و
                            اطلاعات قبلی آن حفظ خواهد شد.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            انصراف
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(event) => {
                                event.preventDefault();
                                confirmDelete();
                            }}
                        >
                            {deleting
                                ? 'در حال حذف...'
                                : 'حذف برند'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function BrandStatusBadge({
                              active,
                          }: {
    active: boolean;
}) {
    return active ? (
        <Badge className="bg-emerald-600 hover:bg-emerald-600">
            فعال
        </Badge>
    ) : (
        <Badge variant="secondary">غیرفعال</Badge>
    );
}

function BrandPagination({
                             brands,
                         }: {
    brands: PaginatedBrands;
}) {
    if (brands.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                نمایش {brands.from ?? 0} تا {brands.to ?? 0} از{' '}
                {brands.total}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {brands.links.map((link, index) => {
                    const label = paginationLabel(
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
                                preserveScroll
                                preserveState
                            >
                                {label}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

function paginationLabel(label: string): string {
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
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <Search className="size-6 text-muted-foreground" />
            </div>

            <h2 className="font-semibold">
                {hasFilters
                    ? 'نتیجه‌ای پیدا نشد'
                    : 'هنوز برندی ایجاد نشده است'}
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {hasFilters
                    ? 'عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید.'
                    : 'برای شروع اولین برند قابل انتخاب برای نمایندگی‌ها را ایجاد کنید.'}
            </p>

            {hasFilters ? (
                <Button
                    variant="outline"
                    className="mt-5"
                    onClick={onClear}
                >
                    پاک‌کردن فیلترها
                </Button>
            ) : (
                <Button className="mt-5" asChild>
                    <Link href="/admin/brands/create">
                        <Plus className="size-4" />
                        ایجاد برند
                    </Link>
                </Button>
            )}
        </div>
    );
}
