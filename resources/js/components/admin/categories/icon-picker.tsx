import { useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import * as LuIcons from 'react-icons/lu';
import * as PiIcons from 'react-icons/pi';
import * as TbIcons from 'react-icons/tb';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

type IconLibrary = 'lu' | 'tb' | 'pi';

interface IconSelection {
    library: IconLibrary;
    name: string;
}

interface IconPickerProps {
    value: IconSelection | null;
    onChange: (value: IconSelection | null) => void;
    error?: string;
}

const libraries: Record<
    IconLibrary,
    {
        label: string;
        icons: Record<string, IconType>;
    }
> = {
    lu: {
        label: 'Lucide',
        icons: LuIcons as Record<string, IconType>,
    },

    tb: {
        label: 'Tabler',
        icons: TbIcons as Record<string, IconType>,
    },

    pi: {
        label: 'Phosphor',
        icons: PiIcons as Record<string, IconType>,
    },
};

const PAGE_SIZE = 120;

export default function IconPicker({
                                       value,
                                       onChange,
                                       error,
                                   }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [library, setLibrary] = useState<IconLibrary>(
        value?.library ?? 'lu',
    );
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] =
        useState(PAGE_SIZE);

    const icons = useMemo(() => {
        const currentLibrary = libraries[library];

        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return Object.entries(currentLibrary.icons)
            .filter(([name, component]) => {
                if (typeof component !== 'function') {
                    return false;
                }

                if (normalizedSearch === '') {
                    return true;
                }

                return name
                    .toLowerCase()
                    .includes(normalizedSearch);
            })
            .sort(([first], [second]) =>
                first.localeCompare(second),
            );
    }, [library, search]);

    const visibleIcons = icons.slice(0, visibleCount);

    const SelectedIcon = value
        ? libraries[value.library].icons[value.name]
        : null;

    const changeLibrary = (nextLibrary: string) => {
        setLibrary(nextLibrary as IconLibrary);
        setSearch('');
        setVisibleCount(PAGE_SIZE);
    };

    const chooseIcon = (name: string) => {
        onChange({
            library,
            name,
        });

        setOpen(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-14 justify-start gap-3"
                        >
                            <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                                {SelectedIcon ? (
                                    <SelectedIcon className="size-5" />
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </span>

                            <span className="text-right">
                                <span className="block font-medium">
                                    {value
                                        ? value.name
                                        : 'انتخاب آیکون'}
                                </span>

                                <span className="block text-xs text-muted-foreground">
                                    {value
                                        ? libraries[
                                            value.library
                                            ].label
                                        : 'برای مشاهده آیکون‌ها کلیک کنید'}
                                </span>
                            </span>
                        </Button>
                    </DialogTrigger>

                    <DialogContent
                        dir="rtl"
                        className="max-w-5xl"
                    >
                        <DialogHeader>
                            <DialogTitle>
                                انتخاب آیکون دسته‌بندی
                            </DialogTitle>

                            <DialogDescription>
                                مجموعه و آیکون موردنظر را انتخاب
                                کنید.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs
                            value={library}
                            onValueChange={changeLibrary}
                        >
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="lu">
                                    Lucide
                                </TabsTrigger>

                                <TabsTrigger value="tb">
                                    Tabler
                                </TabsTrigger>

                                <TabsTrigger value="pi">
                                    Phosphor
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative mt-4">
                                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(
                                            event.target.value,
                                        );

                                        setVisibleCount(
                                            PAGE_SIZE,
                                        );
                                    }}
                                    placeholder="جست‌وجوی نام آیکون، مثلاً Fire یا Home..."
                                    className="pr-9"
                                    dir="ltr"
                                />
                            </div>

                            {(
                                Object.keys(
                                    libraries,
                                ) as IconLibrary[]
                            ).map((libraryKey) => (
                                <TabsContent
                                    key={libraryKey}
                                    value={libraryKey}
                                    className="mt-4"
                                >
                                    <ScrollArea className="h-[480px] rounded-md border p-3">
                                        {visibleIcons.length ===
                                        0 ? (
                                            <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                                                آیکونی پیدا نشد.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                                                {visibleIcons.map(
                                                    ([
                                                         name,
                                                         Icon,
                                                     ]) => {
                                                        const selected =
                                                            value?.library ===
                                                            library &&
                                                            value?.name ===
                                                            name;

                                                        return (
                                                            <button
                                                                key={
                                                                    name
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    chooseIcon(
                                                                        name,
                                                                    )
                                                                }
                                                                title={
                                                                    name
                                                                }
                                                                className={[
                                                                    'flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-md border p-2 transition',
                                                                    selected
                                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                                        : 'border-transparent hover:border-border hover:bg-muted',
                                                                ].join(
                                                                    ' ',
                                                                )}
                                                            >
                                                                <Icon className="size-6 shrink-0" />

                                                                <span
                                                                    dir="ltr"
                                                                    className="w-full truncate text-[10px]"
                                                                >
                                                                    {
                                                                        name
                                                                    }
                                                                </span>
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        )}

                                        {visibleCount <
                                            icons.length && (
                                                <div className="mt-5 flex justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setVisibleCount(
                                                                (
                                                                    current,
                                                                ) =>
                                                                    current +
                                                                    PAGE_SIZE,
                                                            )
                                                        }
                                                    >
                                                        نمایش موارد بیشتر
                                                    </Button>
                                                </div>
                                            )}
                                    </ScrollArea>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        نمایش{' '}
                                        {Math.min(
                                            visibleCount,
                                            icons.length,
                                        )}{' '}
                                        از {icons.length} آیکون
                                    </p>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </DialogContent>
                </Dialog>

                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onChange(null)}
                    >
                        <X className="size-4" />
                        حذف آیکون
                    </Button>
                )}
            </div>

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
