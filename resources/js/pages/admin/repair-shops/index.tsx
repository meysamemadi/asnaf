import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    Building2,
    MapPin,
    MapPinned,
    Pencil,
    Plus,
    Search,
    Star,
    Tags,
    Trash2,
    UserRound,
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
    BusinessLicenseStatus,
    PaginatedRepairShops,
    RepairShopActivityFilter,
    RepairShopApprovalStatus,
    RepairShopFeaturedFilter,
    RepairShopFilterOptions,
    RepairShopFilters,
    RepairShopListItem,
    RepairShopVerificationFilter,
} from '@/types/repair-shop';

interface IndexRepairShopPageProps {
    repairShops: PaginatedRepairShops;
    filters: RepairShopFilters;
    filterOptions: RepairShopFilterOptions;
}

type SelectableApprovalStatus =
    | RepairShopApprovalStatus
    | 'all';

type SelectableActivity =
    | Exclude<RepairShopActivityFilter, null>
    | 'all';

type SelectableVerification =
    | Exclude<RepairShopVerificationFilter, null>
    | 'all';

type SelectableFeatured =
    | Exclude<RepairShopFeaturedFilter, null>
    | 'all';

export default function IndexRepairShopPage({
                                                repairShops,
                                                filters,
                                                filterOptions,
                                            }: IndexRepairShopPageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [approvalStatus, setApprovalStatus] =
        useState<SelectableApprovalStatus>(
            filters.approval_status ?? 'all',
        );

    const [activity, setActivity] =
        useState<SelectableActivity>(
            filters.activity ?? 'all',
        );

    const [verification, setVerification] =
        useState<SelectableVerification>(
            filters.verification ?? 'all',
        );

    const [featured, setFeatured] =
        useState<SelectableFeatured>(
            filters.featured ?? 'all',
        );

    const [cityId, setCityId] = useState(
        filters.city_id
            ? String(filters.city_id)
            : 'all',
    );

    const [categoryId, setCategoryId] = useState(
        filters.category_id
            ? String(filters.category_id)
            : 'all',
    );

    const [selectedRepairShop, setSelectedRepairShop] =
        useState<RepairShopListItem | null>(null);

    const [deleting, setDeleting] = useState(false);

    const initialRender = useRef(true);

    const loadRepairShops = useCallback(() => {
        router.get(
            '/admin/repair-shops',
            {
                search: search.trim() || undefined,

                approval_status:
                    approvalStatus === 'all'
                        ? undefined
                        : approvalStatus,

                activity:
                    activity === 'all'
                        ? undefined
                        : activity,

                verification:
                    verification === 'all'
                        ? undefined
                        : verification,

                featured:
                    featured === 'all'
                        ? undefined
                        : featured,

                city_id:
                    cityId === 'all'
                        ? undefined
                        : Number(cityId),

                category_id:
                    categoryId === 'all'
                        ? undefined
                        : Number(categoryId),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,

                only: [
                    'repairShops',
                    'filters',
                ],
            },
        );
    }, [
        search,
        approvalStatus,
        activity,
        verification,
        featured,
        cityId,
        categoryId,
    ]);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const timeout = window.setTimeout(
            loadRepairShops,
            450,
        );

        return () => {
            window.clearTimeout(timeout);
        };
    }, [loadRepairShops]);

    const clearFilters = () => {
        setSearch('');
        setApprovalStatus('all');
        setActivity('all');
        setVerification('all');
        setFeatured('all');
        setCityId('all');
        setCategoryId('all');
    };

    const confirmDelete = () => {
        if (!selectedRepairShop) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/admin/repair-shops/${selectedRepairShop.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedRepairShop(null);
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    const hasFilters =
        search.trim() !== '' ||
        approvalStatus !== 'all' ||
        activity !== 'all' ||
        verification !== 'all' ||
        featured !== 'all' ||
        cityId !== 'all' ||
        categoryId !== 'all';

    return (
        <>
            <Head title="مدیریت تعمیرگاه‌ها" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-[1600px] p-4 md:p-6"
            >
                <PageHeader />

                <RepairShopFiltersCard
                    search={search}
                    onSearchChange={setSearch}
                    approvalStatus={approvalStatus}
                    onApprovalStatusChange={
                        setApprovalStatus
                    }
                    activity={activity}
                    onActivityChange={setActivity}
                    verification={verification}
                    onVerificationChange={
                        setVerification
                    }
                    featured={featured}
                    onFeaturedChange={setFeatured}
                    cityId={cityId}
                    onCityIdChange={setCityId}
                    categoryId={categoryId}
                    onCategoryIdChange={setCategoryId}
                    options={filterOptions}
                    hasFilters={hasFilters}
                    onClear={clearFilters}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>
                            فهرست تعمیرگاه‌ها
                        </CardTitle>

                        <CardDescription>
                            مجموعاً {repairShops.total}{' '}
                            تعمیرگاه ثبت شده است.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {repairShops.data.length === 0 ? (
                            <EmptyState
                                hasFilters={hasFilters}
                                onClear={clearFilters}
                            />
                        ) : (
                            <>
                                <RepairShopsTable
                                    repairShops={
                                        repairShops.data
                                    }
                                    onDelete={
                                        setSelectedRepairShop
                                    }
                                />

                                <RepairShopPagination
                                    repairShops={
                                        repairShops
                                    }
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <DeleteRepairShopDialog
                repairShop={selectedRepairShop}
                deleting={deleting}
                onClose={() =>
                    setSelectedRepairShop(null)
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}

function PageHeader() {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    مدیریت تعمیرگاه‌ها
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    مدیریت واحدهای صنفی، تخصص‌ها،
                    نمایندگی‌ها و مناطق تحت پوشش
                </p>
            </div>

            <Button asChild>
                <Link href="/admin/repair-shops/create">
                    <Plus className="size-4" />
                    ایجاد تعمیرگاه
                </Link>
            </Button>
        </div>
    );
}

interface RepairShopFiltersCardProps {
    search: string;
    onSearchChange: (value: string) => void;

    approvalStatus: SelectableApprovalStatus;
    onApprovalStatusChange: (
        value: SelectableApprovalStatus,
    ) => void;

    activity: SelectableActivity;
    onActivityChange: (
        value: SelectableActivity,
    ) => void;

    verification: SelectableVerification;
    onVerificationChange: (
        value: SelectableVerification,
    ) => void;

    featured: SelectableFeatured;
    onFeaturedChange: (
        value: SelectableFeatured,
    ) => void;

    cityId: string;
    onCityIdChange: (value: string) => void;

    categoryId: string;
    onCategoryIdChange: (value: string) => void;

    options: RepairShopFilterOptions;

    hasFilters: boolean;
    onClear: () => void;
}

function RepairShopFiltersCard({
                                   search,
                                   onSearchChange,
                                   approvalStatus,
                                   onApprovalStatusChange,
                                   activity,
                                   onActivityChange,
                                   verification,
                                   onVerificationChange,
                                   featured,
                                   onFeaturedChange,
                                   cityId,
                                   onCityIdChange,
                                   categoryId,
                                   onCategoryIdChange,
                                   options,
                                   hasFilters,
                                   onClear,
                               }: RepairShopFiltersCardProps) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-base">
                    جست‌وجو و فیلتر
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative md:col-span-2">
                        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                onSearchChange(
                                    event.target.value,
                                )
                            }
                            className="pr-9"
                            placeholder="نام تعمیرگاه، مسئول، موبایل، کد عضویت یا پروانه..."
                        />
                    </div>

                    <Select
                        value={approvalStatus}
                        onValueChange={(value) =>
                            onApprovalStatusChange(
                                value as SelectableApprovalStatus,
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="وضعیت تأیید" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه وضعیت‌های تأیید
                            </SelectItem>

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
                                        {status.label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>

                    <Select
                        value={activity}
                        onValueChange={(value) =>
                            onActivityChange(
                                value as SelectableActivity,
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="وضعیت فعالیت" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه وضعیت‌های فعالیت
                            </SelectItem>

                            <SelectItem value="active">
                                فعال
                            </SelectItem>

                            <SelectItem value="inactive">
                                غیرفعال
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={verification}
                        onValueChange={(value) =>
                            onVerificationChange(
                                value as SelectableVerification,
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="وضعیت اعتبارسنجی" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه وضعیت‌های اعتبار
                            </SelectItem>

                            <SelectItem value="verified">
                                احراز‌شده
                            </SelectItem>

                            <SelectItem value="unverified">
                                احراز‌نشده
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={featured}
                        onValueChange={(value) =>
                            onFeaturedChange(
                                value as SelectableFeatured,
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="نمایش ویژه" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه تعمیرگاه‌ها
                            </SelectItem>

                            <SelectItem value="featured">
                                ویژه
                            </SelectItem>

                            <SelectItem value="normal">
                                عادی
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={cityId}
                        onValueChange={onCityIdChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="شهر" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه شهرها
                            </SelectItem>

                            {options.cities.map(
                                (city) => (
                                    <SelectItem
                                        key={city.id}
                                        value={String(
                                            city.id,
                                        )}
                                    >
                                        {city.label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>

                    <Select
                        value={categoryId}
                        onValueChange={
                            onCategoryIdChange
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="تخصص" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه تخصص‌ها
                            </SelectItem>

                            {options.categories.map(
                                (category) => (
                                    <SelectItem
                                        key={
                                            category.id
                                        }
                                        value={String(
                                            category.id,
                                        )}
                                    >
                                        {category.label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {hasFilters && (
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClear}
                        >
                            <X className="size-4" />
                            پاک‌کردن فیلترها
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function RepairShopsTable({
                              repairShops,
                              onDelete,
                          }: {
    repairShops: RepairShopListItem[];
    onDelete: (
        repairShop: RepairShopListItem,
    ) => void;
}) {
    return (
        <div className="overflow-x-auto">
            <Table className="min-w-[1350px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right">
                            تعمیرگاه
                        </TableHead>

                        <TableHead className="text-right">
                            موقعیت
                        </TableHead>

                        <TableHead className="text-right">
                            تخصص اصلی
                        </TableHead>

                        <TableHead className="text-right">
                            تماس
                        </TableHead>

                        <TableHead className="text-center">
                            اطلاعات تکمیلی
                        </TableHead>

                        <TableHead className="text-center">
                            تأیید
                        </TableHead>

                        <TableHead className="text-center">
                            پروانه
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
                    {repairShops.map(
                        (repairShop) => (
                            <TableRow
                                key={repairShop.id}
                            >
                                <TableCell>
                                    <RepairShopIdentity
                                        repairShop={
                                            repairShop
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <RepairShopLocation
                                        repairShop={
                                            repairShop
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    {repairShop.primary_category ? (
                                        <Badge variant="outline">
                                            {
                                                repairShop
                                                    .primary_category
                                                    .name
                                            }
                                        </Badge>
                                    ) : (
                                        <MutedDash />
                                    )}
                                </TableCell>

                                <TableCell>
                                    <RepairShopContact
                                        repairShop={
                                            repairShop
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <RepairShopCounts
                                        repairShop={
                                            repairShop
                                        }
                                    />
                                </TableCell>

                                <TableCell className="text-center">
                                    <ApprovalStatusBadge
                                        status={
                                            repairShop.approval_status
                                        }
                                        label={
                                            repairShop.approval_status_label
                                        }
                                    />
                                </TableCell>

                                <TableCell className="text-center">
                                    <LicenseStatusBadge
                                        status={
                                            repairShop.business_license_status
                                        }
                                        label={
                                            repairShop.business_license_status_label
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <RepairShopFlags
                                        repairShop={
                                            repairShop
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <RepairShopActions
                                        repairShop={
                                            repairShop
                                        }
                                        onDelete={
                                            onDelete
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function RepairShopIdentity({
                                repairShop,
                            }: {
    repairShop: RepairShopListItem;
}) {
    return (
        <div className="flex min-w-64 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {repairShop.logo_url ? (
                    <img
                        src={repairShop.logo_url}
                        alt={`لوگوی ${repairShop.name}`}
                        className="size-full object-contain p-1"
                    />
                ) : (
                    <Building2 className="size-5 text-muted-foreground" />
                )}
            </div>

            <div className="min-w-0">
                <p className="truncate font-medium">
                    {repairShop.name}
                </p>

                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="size-3.5" />

                    <span className="truncate">
                        {repairShop.owner_name}
                    </span>
                </div>

                <code
                    dir="ltr"
                    className="mt-1 block max-w-48 truncate text-[11px] text-muted-foreground"
                >
                    {repairShop.slug}
                </code>
            </div>
        </div>
    );
}

function RepairShopLocation({
                                repairShop,
                            }: {
    repairShop: RepairShopListItem;
}) {
    if (!repairShop.city) {
        return <MutedDash />;
    }

    return (
        <div className="min-w-36 space-y-1">
            <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="size-4 text-muted-foreground" />

                <span>
                    {repairShop.city.name}
                </span>
            </div>

            {repairShop.city.province_name && (
                <p className="pr-5 text-xs text-muted-foreground">
                    {repairShop.city.province_name}
                </p>
            )}
        </div>
    );
}

function RepairShopContact({
                               repairShop,
                           }: {
    repairShop: RepairShopListItem;
}) {
    const contact =
        repairShop.mobile ?? repairShop.phone;

    if (!contact) {
        return <MutedDash />;
    }

    return (
        <span
            dir="ltr"
            className="inline-block text-sm"
        >
            {contact}
        </span>
    );
}

function RepairShopCounts({
                              repairShop,
                          }: {
    repairShop: RepairShopListItem;
}) {
    return (
        <div className="flex min-w-52 flex-wrap justify-center gap-2">
            <Badge
                variant="outline"
                className="gap-1"
            >
                <Tags className="size-3.5" />
                {repairShop.categories_count} تخصص
            </Badge>

            <Badge
                variant="outline"
                className="gap-1"
            >
                <BadgeCheck className="size-3.5" />
                {repairShop.agencies_count} نمایندگی
            </Badge>

            <Badge
                variant="outline"
                className="gap-1"
            >
                <MapPinned className="size-3.5" />
                {repairShop.service_areas_count} محدوده
            </Badge>
        </div>
    );
}

function RepairShopFlags({
                             repairShop,
                         }: {
    repairShop: RepairShopListItem;
}) {
    return (
        <div className="flex min-w-32 flex-col items-center gap-1.5">
            <Badge
                variant={
                    repairShop.is_active
                        ? 'default'
                        : 'secondary'
                }
            >
                {repairShop.is_active
                    ? 'فعال'
                    : 'غیرفعال'}
            </Badge>

            <div className="flex gap-1">
                {repairShop.is_verified && (
                    <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                    >
                        <BadgeCheck className="size-3" />
                        معتبر
                    </Badge>
                )}

                {repairShop.is_featured && (
                    <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400"
                    >
                        <Star className="size-3" />
                        ویژه
                    </Badge>
                )}
            </div>
        </div>
    );
}

function RepairShopActions({
                               repairShop,
                               onDelete,
                           }: {
    repairShop: RepairShopListItem;
    onDelete: (
        repairShop: RepairShopListItem,
    ) => void;
}) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                size="icon"
                asChild
                title="ویرایش تعمیرگاه"
            >
                <Link
                    href={`/admin/repair-shops/${repairShop.id}/edit`}
                >
                    <Pencil className="size-4" />
                </Link>
            </Button>

            <Button
                type="button"
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="آرشیو تعمیرگاه"
                onClick={() =>
                    onDelete(repairShop)
                }
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}

function ApprovalStatusBadge({
                                 status,
                                 label,
                             }: {
    status: RepairShopApprovalStatus;
    label: string;
}) {
    switch (status) {
        case 'approved':
            return (
                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                    {label}
                </Badge>
            );

        case 'rejected':
            return (
                <Badge variant="destructive">
                    {label}
                </Badge>
            );

        default:
            return (
                <Badge
                    variant="secondary"
                    className="text-amber-700 dark:text-amber-400"
                >
                    {label}
                </Badge>
            );
    }
}

function LicenseStatusBadge({
                                status,
                                label,
                            }: {
    status: BusinessLicenseStatus;
    label: string;
}) {
    switch (status) {
        case 'valid':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                >
                    {label}
                </Badge>
            );

        case 'expired':
        case 'revoked':
            return (
                <Badge variant="destructive">
                    {label}
                </Badge>
            );

        case 'suspended':
            return (
                <Badge
                    variant="outline"
                    className="border-orange-500/40 text-orange-700 dark:text-orange-400"
                >
                    {label}
                </Badge>
            );

        default:
            return (
                <Badge variant="secondary">
                    {label}
                </Badge>
            );
    }
}

function DeleteRepairShopDialog({
                                    repairShop,
                                    deleting,
                                    onClose,
                                    onConfirm,
                                }: {
    repairShop: RepairShopListItem | null;
    deleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog
            open={repairShop !== null}
            onOpenChange={(open) => {
                if (!open && !deleting) {
                    onClose();
                }
            }}
        >
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        آرشیو تعمیرگاه
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        آیا از آرشیو تعمیرگاه «
                        {repairShop?.name}» مطمئن هستید؟
                        اطلاعات، نمایندگی‌ها و مناطق تحت
                        پوشش حذف دائمی نمی‌شوند.
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
                            ? 'در حال آرشیو...'
                            : 'آرشیو تعمیرگاه'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function RepairShopPagination({
                                  repairShops,
                              }: {
    repairShops: PaginatedRepairShops;
}) {
    if (repairShops.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                نمایش {repairShops.from ?? 0} تا{' '}
                {repairShops.to ?? 0} از{' '}
                {repairShops.total}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {repairShops.links.map(
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
                <Building2 className="size-6 text-muted-foreground" />
            </div>

            <h2 className="font-semibold">
                {hasFilters
                    ? 'تعمیرگاهی پیدا نشد'
                    : 'هنوز تعمیرگاهی ثبت نشده است'}
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {hasFilters
                    ? 'فیلترها یا عبارت جست‌وجو را تغییر دهید.'
                    : 'برای شروع، اولین تعمیرگاه یا واحد صنفی را ثبت کنید.'}
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
                    <Link href="/admin/repair-shops/create">
                        <Plus className="size-4" />
                        ایجاد تعمیرگاه
                    </Link>
                </Button>
            )}
        </div>
    );
}

function MutedDash() {
    return (
        <span className="text-muted-foreground">
            —
        </span>
    );
}
