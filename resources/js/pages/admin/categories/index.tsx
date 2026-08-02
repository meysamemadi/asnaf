import {
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import CategoryIcon from '@/components/admin/categories/category-icon';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

import type {
    Category,
    PaginatedCategories,
} from '@/types/category';

interface IndexCategoryPageProps {
    categories: PaginatedCategories;

    filters: {
        search: string;
    };
}

export default function IndexCategoryPage({
                                              categories,
                                              filters,
                                          }: IndexCategoryPageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [selectedCategory, setSelectedCategory] =
        useState<Category | null>(null);

    const [deleting, setDeleting] = useState(false);

    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            performSearch(search);
        }, 500);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [search]);

    const performSearch = (value: string) => {
        router.get(
            '/admin/categories',
            {
                search: value.trim() || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['categories', 'filters'],
            },
        );
    };

    const submitSearch = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        performSearch(search);
    };

    const clearSearch = () => {
        setSearch('');

        router.get(
            '/admin/categories',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['categories', 'filters'],
            },
        );
    };

    const requestDelete = (category: Category) => {
        if (category.children_count > 0) {
            return;
        }

        setSelectedCategory(category);
    };

    const confirmDelete = () => {
        if (!selectedCategory) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/admin/categories/${selectedCategory.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedCategory(null);
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="مدیریت دسته‌بندی‌ها" />

            <main
                dir="rtl"
                className="mx-auto w-full max-w-7xl p-4 md:p-6"
            >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            مدیریت دسته‌بندی‌ها
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            ایجاد، ویرایش و مدیریت دسته‌بندی‌های
                            سایت
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/categories/create">
                            <Plus className="size-4" />
                            ایجاد دسته‌بندی
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>فهرست دسته‌بندی‌ها</CardTitle>

                            <CardDescription className="mt-2">
                                مجموعاً {categories.total} دسته‌بندی
                                ثبت شده است.
                            </CardDescription>
                        </div>

                        <form
                            onSubmit={submitSearch}
                            className="relative max-w-xl"
                        >
                            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="pr-9 pl-10"
                                placeholder="جست‌وجو در نام، نامک، توضیحات یا والد..."
                            />

                            {search !== '' && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-0 top-1/2 size-9 -translate-y-1/2"
                                    onClick={clearSearch}
                                    title="پاک‌کردن جست‌وجو"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </form>
                    </CardHeader>

                    <CardContent className="p-0">
                        {categories.data.length === 0 ? (
                            <EmptyState
                                hasSearch={
                                    filters.search !== ''
                                }
                                onClear={clearSearch}
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[950px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">
                                                    دسته‌بندی
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    والد
                                                </TableHead>

                                                <TableHead className="text-right">
                                                    نامک
                                                </TableHead>

                                                <TableHead className="text-center">
                                                    زیرمجموعه
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
                                            {categories.data.map(
                                                (category) => (
                                                    <TableRow
                                                        key={
                                                            category.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                                                                    <CategoryIcon
                                                                        library={category.icon_library}
                                                                        name={category.icon}
                                                                        className="size-5"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <p className="font-medium">
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        شناسه:{' '}
                                                                        {
                                                                            category.id
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            {category
                                                                .parent
                                                                ?.name ?? (
                                                                <span className="text-muted-foreground">
                                                                    دسته
                                                                    اصلی
                                                                </span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <code
                                                                dir="ltr"
                                                                className="rounded bg-muted px-2 py-1 text-xs"
                                                            >
                                                                {
                                                                    category.slug
                                                                }
                                                            </code>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            {
                                                                category.children_count
                                                            }
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            {
                                                                category.sort_order
                                                            }
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <CategoryStatusBadge
                                                                active={
                                                                    category.is_active
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
                                                                        href={`/admin/categories/${category.id}/edit`}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                    </Link>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    disabled={
                                                                        category.children_count >
                                                                        0
                                                                    }
                                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    title={
                                                                        category.children_count >
                                                                        0
                                                                            ? 'ابتدا زیرمجموعه‌ها را حذف یا منتقل کنید'
                                                                            : 'حذف'
                                                                    }
                                                                    onClick={() =>
                                                                        requestDelete(
                                                                            category,
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

                                <CategoryPagination
                                    categories={categories}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <AlertDialog
                open={selectedCategory !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedCategory(null);
                    }
                }}
            >
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            حذف دسته‌بندی
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            آیا از حذف دسته «
                            {selectedCategory?.name}» مطمئن
                            هستید؟ این عملیات قابل بازگشت
                            نیست.
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
                            onClick={(event) => {
                                event.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting
                                ? 'در حال حذف...'
                                : 'حذف دسته‌بندی'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function CategoryStatusBadge({
                                 active,
                             }: {
    active: boolean;
}) {
    if (active) {
        return (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
                فعال
            </Badge>
        );
    }

    return <Badge variant="secondary">غیرفعال</Badge>;
}

interface CategoryPaginationProps {
    categories: PaginatedCategories;
}

function CategoryPagination({
                                categories,
                            }: CategoryPaginationProps) {
    if (categories.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                نمایش {categories.from ?? 0} تا{' '}
                {categories.to ?? 0} از {categories.total}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {categories.links.map((link, index) => {
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

interface EmptyStateProps {
    hasSearch: boolean;
    onClear: () => void;
}

function EmptyState({
                        hasSearch,
                        onClear,
                    }: EmptyStateProps) {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <Search className="size-6 text-muted-foreground" />
            </div>

            <h2 className="font-semibold">
                {hasSearch
                    ? 'نتیجه‌ای پیدا نشد'
                    : 'هنوز دسته‌بندی ایجاد نشده است'}
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {hasSearch
                    ? 'عبارت دیگری را جست‌وجو کنید یا فیلتر جست‌وجو را پاک کنید.'
                    : 'برای شروع، اولین دسته‌بندی سایت را ایجاد کنید.'}
            </p>

            {hasSearch ? (
                <Button
                    variant="outline"
                    className="mt-5"
                    onClick={onClear}
                >
                    پاک‌کردن جست‌وجو
                </Button>
            ) : (
                <Button className="mt-5" asChild>
                    <Link href="/admin/categories/create">
                        <Plus className="size-4" />
                        ایجاد دسته‌بندی
                    </Link>
                </Button>
            )}
        </div>
    );
}
