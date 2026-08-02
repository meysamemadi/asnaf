import {
    BadgeCheck,
    ExternalLink,
    FileBadge,
    Plus,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

import type {
    AgencyStatus,
    RepairShopAgencyFormData,
    RepairShopBrandOption,
    RepairShopStatusOption,
} from '@/types/repair-shop';

interface AgencyManagerProps {
    agencies: RepairShopAgencyFormData[];
    brands: RepairShopBrandOption[];

    statusOptions: RepairShopStatusOption<AgencyStatus>[];

    errors: Record<string, string | undefined>;

    onChange: (
        agencies: RepairShopAgencyFormData[],
    ) => void;
}

export default function AgencyManager({
                                          agencies,
                                          brands,
                                          statusOptions,
                                          errors,
                                          onChange,
                                      }: AgencyManagerProps) {
    const addAgency = () => {
        onChange([
            ...agencies,
            {
                client_id: createClientId('agency'),
                brand_id: null,

                certificate_number: '',
                certificate: null,

                certificate_path: null,
                certificate_url: null,

                remove_certificate: false,

                issued_at: '',
                expires_at: '',

                status: 'pending',
                is_official: false,

                notes: '',
            },
        ]);
    };

    const updateAgency = (
        index: number,
        changes: Partial<RepairShopAgencyFormData>,
    ) => {
        onChange(
            agencies.map((agency, agencyIndex) =>
                agencyIndex === index
                    ? {
                        ...agency,
                        ...changes,
                    }
                    : agency,
            ),
        );
    };

    const removeAgency = (index: number) => {
        onChange(
            agencies.filter(
                (_, agencyIndex) =>
                    agencyIndex !== index,
            ),
        );
    };

    const selectedBrandIds = agencies
        .map((agency) => agency.brand_id)
        .filter(
            (brandId): brandId is number =>
                brandId !== null,
        );

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="font-medium">
                        نمایندگی‌های تعمیرگاه
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        برند، مدرک و وضعیت هر نمایندگی را
                        مشخص کنید.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={addAgency}
                    disabled={
                        agencies.length >= brands.length &&
                        brands.length > 0
                    }
                >
                    <Plus className="size-4" />
                    افزودن نمایندگی
                </Button>
            </div>

            {errors.agencies && (
                <p className="text-sm text-destructive">
                    {errors.agencies}
                </p>
            )}

            {brands.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <BadgeCheck className="mx-auto size-8 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                        برندی برای انتخاب وجود ندارد
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        ابتدا حداقل یک برند فعال در بخش
                        مدیریت برندها ایجاد کنید.
                    </p>
                </div>
            ) : agencies.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <FileBadge className="mx-auto size-8 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                        نمایندگی ثبت نشده است
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        ثبت نمایندگی برای تعمیرگاه اختیاری
                        است.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {agencies.map((agency, index) => {
                        const rowKey =
                            agency.client_id ??
                            `${agency.brand_id ?? 'new'}-${index}`;

                        return (
                            <Card key={rowKey}>
                                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                                    <CardTitle className="text-base">
                                        نمایندگی شماره{' '}
                                        {index + 1}
                                    </CardTitle>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        title="حذف نمایندگی"
                                        onClick={() =>
                                            removeAgency(
                                                index,
                                            )
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        <AgencyField
                                            label="برند"
                                            htmlFor={`agencies-${index}-brand`}
                                            error={
                                                errors[
                                                    `agencies.${index}.brand_id`
                                                    ]
                                            }
                                            required
                                        >
                                            <Select
                                                value={
                                                    agency.brand_id
                                                        ? String(
                                                            agency.brand_id,
                                                        )
                                                        : ''
                                                }
                                                onValueChange={(
                                                    value,
                                                ) =>
                                                    updateAgency(
                                                        index,
                                                        {
                                                            brand_id:
                                                                Number(
                                                                    value,
                                                                ),
                                                        },
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id={`agencies-${index}-brand`}
                                                >
                                                    <SelectValue placeholder="انتخاب برند" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {brands.map(
                                                        (
                                                            brand,
                                                        ) => {
                                                            const usedByAnotherRow =
                                                                selectedBrandIds.includes(
                                                                    brand.id,
                                                                ) &&
                                                                agency.brand_id !==
                                                                brand.id;

                                                            return (
                                                                <SelectItem
                                                                    key={
                                                                        brand.id
                                                                    }
                                                                    value={String(
                                                                        brand.id,
                                                                    )}
                                                                    disabled={
                                                                        usedByAnotherRow
                                                                    }
                                                                >
                                                                    {
                                                                        brand.name
                                                                    }
                                                                </SelectItem>
                                                            );
                                                        },
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </AgencyField>

                                        <AgencyField
                                            label="شماره گواهی نمایندگی"
                                            htmlFor={`agencies-${index}-certificate-number`}
                                            error={
                                                errors[
                                                    `agencies.${index}.certificate_number`
                                                    ]
                                            }
                                        >
                                            <Input
                                                id={`agencies-${index}-certificate-number`}
                                                value={
                                                    agency.certificate_number
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateAgency(
                                                        index,
                                                        {
                                                            certificate_number:
                                                            event
                                                                .target
                                                                .value,
                                                        },
                                                    )
                                                }
                                            />
                                        </AgencyField>

                                        <AgencyField
                                            label="وضعیت نمایندگی"
                                            htmlFor={`agencies-${index}-status`}
                                            error={
                                                errors[
                                                    `agencies.${index}.status`
                                                    ]
                                            }
                                            required
                                        >
                                            <Select
                                                value={
                                                    agency.status
                                                }
                                                onValueChange={(
                                                    value,
                                                ) =>
                                                    updateAgency(
                                                        index,
                                                        {
                                                            status: value as AgencyStatus,
                                                        },
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id={`agencies-${index}-status`}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {statusOptions.map(
                                                        (
                                                            status,
                                                        ) => (
                                                            <SelectItem
                                                                key={
                                                                    status.value
                                                                }
                                                                value={
                                                                    status.value
                                                                }
                                                            >
                                                                {
                                                                    status.label
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </AgencyField>

                                        <AgencyField
                                            label="تاریخ صدور"
                                            htmlFor={`agencies-${index}-issued-at`}
                                            error={
                                                errors[
                                                    `agencies.${index}.issued_at`
                                                    ]
                                            }
                                        >
                                            <Input
                                                id={`agencies-${index}-issued-at`}
                                                type="date"
                                                dir="ltr"
                                                value={
                                                    agency.issued_at
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateAgency(
                                                        index,
                                                        {
                                                            issued_at:
                                                            event
                                                                .target
                                                                .value,
                                                        },
                                                    )
                                                }
                                            />
                                        </AgencyField>

                                        <AgencyField
                                            label="تاریخ انقضا"
                                            htmlFor={`agencies-${index}-expires-at`}
                                            error={
                                                errors[
                                                    `agencies.${index}.expires_at`
                                                    ]
                                            }
                                        >
                                            <Input
                                                id={`agencies-${index}-expires-at`}
                                                type="date"
                                                dir="ltr"
                                                value={
                                                    agency.expires_at
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateAgency(
                                                        index,
                                                        {
                                                            expires_at:
                                                            event
                                                                .target
                                                                .value,
                                                        },
                                                    )
                                                }
                                            />
                                        </AgencyField>

                                        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                            <div>
                                                <Label
                                                    htmlFor={`agencies-${index}-official`}
                                                >
                                                    نمایندگی رسمی
                                                </Label>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    این نمایندگی
                                                    از طرف برند
                                                    تأیید شده است.
                                                </p>
                                            </div>

                                            <Switch
                                                dir={"ltr"}
                                                id={`agencies-${index}-official`}
                                                checked={
                                                    agency.is_official
                                                }
                                                onCheckedChange={(
                                                    checked,
                                                ) =>
                                                    updateAgency(
                                                        index,
                                                        {
                                                            is_official:
                                                            checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <AgencyField
                                        label="مدرک نمایندگی"
                                        htmlFor={`agencies-${index}-certificate`}
                                        error={
                                            errors[
                                                `agencies.${index}.certificate`
                                                ]
                                        }
                                        description="PDF یا تصویر با حداکثر حجم ۵ مگابایت"
                                    >
                                        <Input
                                            id={`agencies-${index}-certificate`}
                                            type="file"
                                            accept="application/pdf,image/png,image/jpeg,image/webp"
                                            onChange={(
                                                event,
                                            ) =>
                                                updateAgency(
                                                    index,
                                                    {
                                                        certificate:
                                                            event
                                                                .target
                                                                .files?.[0] ??
                                                            null,

                                                        remove_certificate:
                                                            false,
                                                    },
                                                )
                                            }
                                        />

                                        {agency.certificate && (
                                            <p
                                                dir="ltr"
                                                className="mt-2 truncate text-xs text-muted-foreground"
                                            >
                                                {
                                                    agency
                                                        .certificate
                                                        .name
                                                }
                                            </p>
                                        )}

                                        {agency.certificate_url &&
                                            !agency.remove_certificate &&
                                            !agency.certificate && (
                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    <a
                                                        href={
                                                            agency.certificate_url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                                    >
                                                        مشاهده مدرک
                                                        فعلی

                                                        <ExternalLink className="size-3.5" />
                                                    </a>

                                                    <label className="flex items-center gap-2 text-sm">
                                                        <Checkbox
                                                            checked={
                                                                agency.remove_certificate
                                                            }
                                                            onCheckedChange={(
                                                                value,
                                                            ) =>
                                                                updateAgency(
                                                                    index,
                                                                    {
                                                                        remove_certificate:
                                                                            value ===
                                                                            true,
                                                                    },
                                                                )
                                                            }
                                                        />

                                                        حذف مدرک
                                                        فعلی
                                                    </label>
                                                </div>
                                            )}

                                        {agency.certificate_url &&
                                            agency.remove_certificate && (
                                                <label className="mt-3 flex items-center gap-2 text-sm text-destructive">
                                                    <Checkbox
                                                        checked
                                                        onCheckedChange={(
                                                            value,
                                                        ) =>
                                                            updateAgency(
                                                                index,
                                                                {
                                                                    remove_certificate:
                                                                        value ===
                                                                        true,
                                                                },
                                                            )
                                                        }
                                                    />

                                                    مدرک فعلی حذف
                                                    خواهد شد
                                                </label>
                                            )}
                                    </AgencyField>

                                    <AgencyField
                                        label="یادداشت"
                                        htmlFor={`agencies-${index}-notes`}
                                        error={
                                            errors[
                                                `agencies.${index}.notes`
                                                ]
                                        }
                                    >
                                        <Textarea
                                            id={`agencies-${index}-notes`}
                                            rows={3}
                                            value={
                                                agency.notes
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateAgency(
                                                    index,
                                                    {
                                                        notes: event
                                                            .target
                                                            .value,
                                                    },
                                                )
                                            }
                                            placeholder="توضیحات تکمیلی درباره نمایندگی..."
                                        />
                                    </AgencyField>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AgencyField({
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
    children: React.ReactNode;
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

function createClientId(prefix: string): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}
