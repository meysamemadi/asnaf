/// <reference types="leaflet-draw" />

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import type * as Leaflet from 'leaflet';
import {
    Eye,
    Layers3,
    LoaderCircle,
    MapPinned,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type {
    RepairShopServiceAreaFormData,
    ServiceAreaGeoJson,
} from '@/types/repair-shop';

interface ServiceAreaManagerProps {
    areas: RepairShopServiceAreaFormData[];

    centerLatitude: number | null;
    centerLongitude: number | null;

    errors: Record<string, string | undefined>;

    onChange: (
        areas: RepairShopServiceAreaFormData[],
    ) => void;
}

type ServiceAreaLayer = Leaflet.Layer & {
    __serviceAreaClientId?: string;
};

type GlobalWithLeaflet = typeof globalThis & {
    L?: typeof Leaflet;
};

const DEFAULT_CENTER: [number, number] = [
    32.4279,
    53.688,
];

export default function ServiceAreaManager({
                                               areas,
                                               centerLatitude,
                                               centerLongitude,
                                               errors,
                                               onChange,
                                           }: ServiceAreaManagerProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    const mapRef =
        useRef<Leaflet.Map | null>(null);

    const featureGroupRef =
        useRef<Leaflet.FeatureGroup | null>(
            null,
        );

    const leafletRef =
        useRef<typeof Leaflet | null>(null);

    const layerMapRef = useRef<
        Map<string, Leaflet.Layer[]>
    >(new Map());

    const areasRef = useRef(areas);
    const onChangeRef = useRef(onChange);

    /*
     * مختصات اولیه فقط هنگام ساخت نقشه استفاده می‌شود.
     * تغییرات بعدی توسط Effect جداگانه اعمال می‌شوند.
     */
    const initialCenterRef = useRef({
        latitude: centerLatitude,
        longitude: centerLongitude,
    });

    const [mapReady, setMapReady] =
        useState(false);

    const [mapError, setMapError] =
        useState<string | null>(null);

    useEffect(() => {
        areasRef.current = areas;
    }, [areas]);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const syncAreasFromLayers = useCallback(
        (
            featureGroup:
            Leaflet.FeatureGroup,
        ): void => {
            const polygonsByClientId =
                new Map<
                    string,
                    number[][][][]
                >();

            featureGroup.eachLayer(
                (layer) => {
                    const serviceAreaLayer =
                        layer as ServiceAreaLayer;

                    const clientId =
                        serviceAreaLayer
                            .__serviceAreaClientId;

                    if (!clientId) {
                        return;
                    }

                    const geometry =
                        layerToGeometry(
                            serviceAreaLayer,
                        );

                    if (!geometry) {
                        return;
                    }

                    const polygons =
                        geometry.type ===
                        'Polygon'
                            ? [
                                geometry.coordinates,
                            ]
                            : geometry.coordinates;

                    const existingPolygons =
                        polygonsByClientId.get(
                            clientId,
                        ) ?? [];

                    existingPolygons.push(
                        ...polygons,
                    );

                    polygonsByClientId.set(
                        clientId,
                        existingPolygons,
                    );
                },
            );

            const nextAreas =
                areasRef.current.flatMap(
                    (area) => {
                        const clientId =
                            getAreaClientId(
                                area,
                            );

                        const polygons =
                            polygonsByClientId.get(
                                clientId,
                            );

                        /*
                         * اگر لایه‌ای از نقشه حذف شده باشد،
                         * آن محدوده نیز از State حذف می‌شود.
                         */
                        if (
                            !polygons ||
                            polygons.length === 0
                        ) {
                            return [];
                        }

                        const geojson:
                            ServiceAreaGeoJson =
                            polygons.length === 1
                                ? {
                                    type: 'Polygon',
                                    coordinates:
                                        polygons[0],
                                }
                                : {
                                    type: 'MultiPolygon',
                                    coordinates:
                                    polygons,
                                };

                        return [
                            {
                                ...area,
                                geojson,
                            },
                        ];
                    },
                );

            onChangeRef.current(
                nextAreas.map(
                    (area, index) => ({
                        ...area,
                        sort_order: index,
                    }),
                ),
            );
        },
        [],
    );

    /*
     * ساخت اولیه نقشه و Leaflet Draw
     */
    useEffect(() => {
        let cancelled = false;

        const initializeMap =
            async (): Promise<void> => {
                if (
                    cancelled ||
                    !containerRef.current ||
                    mapRef.current
                ) {
                    return;
                }

                try {
                    setMapError(null);

                    const leafletModule =
                        await import(
                            'leaflet'
                            );

                    /*
                     * بسته به نحوه Bundle شدن توسط Vite،
                     * Leaflet ممکن است داخل default باشد.
                     */
                    const L = resolveLeaflet(
                        leafletModule,
                    );

                    /*
                     * leaflet-draw یک افزونه قدیمی است و
                     * برای بعضی Buildها به متغیر سراسری L
                     * وابسته است.
                     */
                    (
                        globalThis as
                            GlobalWithLeaflet
                    ).L = L;

                    await import(
                        'leaflet-draw'
                        );

                    if (
                        cancelled ||
                        !containerRef.current
                    ) {
                        return;
                    }

                    if (
                        !L.Control.Draw ||
                        !L.drawLocal ||
                        !L.Draw?.Event
                    ) {
                        throw new Error(
                            'افزونه Leaflet Draw به‌درستی بارگذاری نشده است.',
                        );
                    }

                    leafletRef.current = L;

                    localizeDrawControls(L);

                    const initialLatitude =
                        initialCenterRef.current
                            .latitude;

                    const initialLongitude =
                        initialCenterRef.current
                            .longitude;

                    const hasCenter =
                        initialLatitude !== null &&
                        initialLongitude !== null &&
                        Number.isFinite(
                            initialLatitude,
                        ) &&
                        Number.isFinite(
                            initialLongitude,
                        );

                    const initialCenter: [
                        number,
                        number,
                    ] = hasCenter
                        ? [
                            initialLatitude,
                            initialLongitude,
                        ]
                        : DEFAULT_CENTER;

                    const map = L.map(
                        containerRef.current,
                        {
                            zoomControl: true,
                            attributionControl:
                                true,
                        },
                    ).setView(
                        initialCenter,
                        hasCenter ? 13 : 5,
                    );

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            maxZoom: 19,

                            attribution:
                                '&copy; OpenStreetMap contributors',
                        },
                    ).addTo(map);

                    const featureGroup =
                        L.featureGroup().addTo(
                            map,
                        );

                    featureGroupRef.current =
                        featureGroup;

                    const drawControl =
                        new L.Control.Draw({
                            position: 'topleft',

                            draw: {
                                polygon: {
                                    allowIntersection:
                                        false,

                                    showArea: true,

                                    repeatMode:
                                        false,
                                },

                                polyline: false,
                                rectangle: false,
                                circle: false,

                                circlemarker:
                                    false,

                                marker: false,
                            },

                            edit: {
                                featureGroup,

                                /*
                                 * مقدار true از نظر Typeهای
                                 * leaflet-draw معتبر نیست.
                                 */
                                edit: {},

                                remove: true,
                            },
                        });

                    map.addControl(
                        drawControl,
                    );

                    const handleCreated:
                        Leaflet.LeafletEventHandlerFn =
                        (event) => {
                            const createdEvent =
                                event as Leaflet.DrawEvents.Created;

                            const layer =
                                createdEvent.layer as ServiceAreaLayer;

                            const clientId =
                                createClientId(
                                    'service-area',
                                );

                            layer.__serviceAreaClientId =
                                clientId;

                            featureGroup.addLayer(
                                layer,
                            );

                            const geometry =
                                layerToGeometry(
                                    layer,
                                );

                            if (!geometry) {
                                featureGroup.removeLayer(
                                    layer,
                                );

                                return;
                            }

                            const currentAreas =
                                areasRef.current;

                            onChangeRef.current([
                                ...currentAreas,

                                {
                                    client_id:
                                    clientId,

                                    name:
                                        `محدوده خدمات ${
                                            currentAreas.length +
                                            1
                                        }`,

                                    geojson:
                                    geometry,

                                    description:
                                        '',

                                    is_active:
                                        true,

                                    sort_order:
                                    currentAreas.length,
                                },
                            ]);
                        };

                    const handleGeometryChange:
                        Leaflet.LeafletEventHandlerFn =
                        () => {
                            syncAreasFromLayers(
                                featureGroup,
                            );
                        };

                    map.on(
                        L.Draw.Event.CREATED,
                        handleCreated,
                    );

                    map.on(
                        L.Draw.Event.EDITED,
                        handleGeometryChange,
                    );

                    map.on(
                        L.Draw.Event.DELETED,
                        handleGeometryChange,
                    );

                    mapRef.current = map;

                    setMapReady(true);

                    /*
                     * وقتی نقشه داخل Card یا Layout ساخته
                     * می‌شود، ممکن است Leaflet اندازه اولیه
                     * را اشتباه محاسبه کند.
                     */
                    window.setTimeout(() => {
                        if (
                            !cancelled &&
                            mapRef.current
                        ) {
                            mapRef.current
                                .invalidateSize();
                        }
                    }, 150);
                } catch (error) {
                    console.error(
                        'Service area map initialization failed:',
                        error,
                    );

                    if (cancelled) {
                        return;
                    }

                    setMapReady(false);

                    setMapError(
                        error instanceof Error
                            ? error.message
                            : 'بارگذاری نقشه با خطا مواجه شد.',
                    );
                }
            };

        void initializeMap();

        return () => {
            cancelled = true;

            mapRef.current?.remove();

            mapRef.current = null;
            featureGroupRef.current = null;
            leafletRef.current = null;

            layerMapRef.current.clear();

            setMapReady(false);
        };
    }, [syncAreasFromLayers]);

    /*
     * تبدیل Areas موجود به لایه‌های Leaflet
     */
    useEffect(() => {
        const L = leafletRef.current;
        const map = mapRef.current;
        const featureGroup =
            featureGroupRef.current;

        if (
            !mapReady ||
            !L ||
            !map ||
            !featureGroup
        ) {
            return;
        }

        featureGroup.clearLayers();
        layerMapRef.current.clear();

        areas.forEach((area) => {
            const clientId =
                getAreaClientId(area);

            try {
                const geoJsonLayer =
                    L.geoJSON(
                        area.geojson,
                    );

                geoJsonLayer.eachLayer(
                    (layer) => {
                        const serviceAreaLayer =
                            layer as ServiceAreaLayer;

                        serviceAreaLayer.__serviceAreaClientId =
                            clientId;

                        featureGroup.addLayer(
                            serviceAreaLayer,
                        );

                        const currentLayers =
                            layerMapRef.current.get(
                                clientId,
                            ) ?? [];

                        currentLayers.push(
                            serviceAreaLayer,
                        );

                        layerMapRef.current.set(
                            clientId,
                            currentLayers,
                        );
                    },
                );
            } catch (error) {
                console.error(
                    `Invalid GeoJSON for service area ${clientId}:`,
                    error,
                );
            }
        });

        if (
            featureGroup.getLayers()
                .length > 0
        ) {
            const bounds =
                featureGroup.getBounds();

            if (bounds.isValid()) {
                map.fitBounds(bounds, {
                    padding: [30, 30],
                    maxZoom: 15,
                });
            }
        }

        window.setTimeout(() => {
            map.invalidateSize();
        }, 50);
    }, [areas, mapReady]);

    /*
     * اگر محدوده‌ای وجود ندارد، با تغییر موقعیت
     * تعمیرگاه مرکز نقشه نیز تغییر می‌کند.
     */
    useEffect(() => {
        const map = mapRef.current;

        if (
            !mapReady ||
            !map ||
            areas.length > 0 ||
            centerLatitude === null ||
            centerLongitude === null ||
            !Number.isFinite(
                centerLatitude,
            ) ||
            !Number.isFinite(
                centerLongitude,
            )
        ) {
            return;
        }

        map.setView(
            [
                centerLatitude,
                centerLongitude,
            ],
            13,
        );
    }, [
        mapReady,
        areas.length,
        centerLatitude,
        centerLongitude,
    ]);

    const updateArea = (
        index: number,
        changes: Partial<RepairShopServiceAreaFormData>,
    ): void => {
        onChange(
            areas.map(
                (area, areaIndex) =>
                    areaIndex === index
                        ? {
                            ...area,
                            ...changes,
                        }
                        : area,
            ),
        );
    };

    const removeArea = (
        index: number,
    ): void => {
        onChange(
            areas
                .filter(
                    (_, areaIndex) =>
                        areaIndex !== index,
                )
                .map(
                    (area, areaIndex) => ({
                        ...area,
                        sort_order:
                        areaIndex,
                    }),
                ),
        );
    };

    const focusArea = (
        area: RepairShopServiceAreaFormData,
    ): void => {
        const L = leafletRef.current;
        const map = mapRef.current;

        if (!L || !map) {
            return;
        }

        const clientId =
            getAreaClientId(area);

        const layers =
            layerMapRef.current.get(
                clientId,
            ) ?? [];

        if (layers.length === 0) {
            return;
        }

        const group =
            L.featureGroup(layers);

        const bounds =
            group.getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [40, 40],
                maxZoom: 16,
            });
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="font-medium">
                    محدوده‌های خدمات
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                    از ابزار چندضلعی در سمت چپ
                    نقشه برای رسم محدوده استفاده
                    کنید. ابزارهای ویرایش و حذف نیز
                    از همان قسمت در دسترس هستند.
                </p>
            </div>

            {errors.service_areas && (
                <p className="text-sm text-destructive">
                    {errors.service_areas}
                </p>
            )}

            {mapError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-destructive">
                    <p className="font-medium">
                        نقشه بارگذاری نشد
                    </p>

                    <p
                        dir="ltr"
                        className="mt-2 text-xs"
                    >
                        {mapError}
                    </p>

                    <p className="mt-3 text-xs">
                        کنسول مرورگر را نیز برای
                        مشاهده جزئیات خطا بررسی
                        کنید.
                    </p>
                </div>
            )}

            <div className="relative">
                <div
                    ref={containerRef}
                    className="h-[520px] w-full overflow-hidden rounded-lg border bg-muted"
                />

                {!mapReady && !mapError && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-muted/80">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-5 animate-spin" />
                            در حال بارگذاری نقشه...
                        </div>
                    </div>
                )}
            </div>

            {areas.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <MapPinned className="mx-auto size-8 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                        محدوده‌ای ترسیم نشده است
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        مناطق تحت پوشش اختیاری
                        هستند. برای اضافه‌کردن،
                        ابزار رسم چندضلعی روی نقشه
                        را انتخاب کنید.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Layers3 className="size-4" />

                        <span className="text-sm font-medium">
                            {areas.length} محدوده
                            ثبت شده
                        </span>
                    </div>

                    {areas.map(
                        (area, index) => (
                            <div
                                key={getAreaClientId(
                                    area,
                                )}
                                className="space-y-4 rounded-lg border p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h4 className="font-medium">
                                        محدوده شماره{' '}
                                        {index + 1}
                                    </h4>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                focusArea(
                                                    area,
                                                )
                                            }
                                        >
                                            <Eye className="size-4" />
                                            نمایش روی نقشه
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                removeArea(
                                                    index,
                                                )
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                            حذف
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`service-area-${index}-name`}
                                        >
                                            نام محدوده

                                            <span className="mr-1 text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Input
                                            id={`service-area-${index}-name`}
                                            value={
                                                area.name
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateArea(
                                                    index,
                                                    {
                                                        name:
                                                        event
                                                            .target
                                                            .value,
                                                    },
                                                )
                                            }
                                            placeholder="برای مثال: گلسار و بلوار دیلمان"
                                        />

                                        {errors[
                                            `service_areas.${index}.name`
                                            ] && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    errors[
                                                        `service_areas.${index}.name`
                                                        ]
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                        <div>
                                            <Label
                                                htmlFor={`service-area-${index}-active`}
                                            >
                                                محدوده فعال
                                            </Label>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                این محدوده
                                                در جست‌وجوی
                                                کاربران لحاظ
                                                شود.
                                            </p>
                                        </div>

                                        <Switch
                                            dir="ltr"
                                            id={`service-area-${index}-active`}
                                            checked={
                                                area.is_active
                                            }
                                            onCheckedChange={(
                                                checked,
                                            ) =>
                                                updateArea(
                                                    index,
                                                    {
                                                        is_active:
                                                        checked,
                                                    },
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor={`service-area-${index}-description`}
                                    >
                                        توضیحات
                                    </Label>

                                    <Textarea
                                        id={`service-area-${index}-description`}
                                        rows={3}
                                        value={
                                            area.description
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateArea(
                                                index,
                                                {
                                                    description:
                                                    event
                                                        .target
                                                        .value,
                                                },
                                            )
                                        }
                                        placeholder="توضیحات اختیاری درباره محدوده خدمات..."
                                    />

                                    {errors[
                                        `service_areas.${index}.description`
                                        ] && (
                                        <p className="text-sm text-destructive">
                                            {
                                                errors[
                                                    `service_areas.${index}.description`
                                                    ]
                                            }
                                        </p>
                                    )}
                                </div>

                                {errors[
                                    `service_areas.${index}.geojson`
                                    ] && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors[
                                                `service_areas.${index}.geojson`
                                                ]
                                        }
                                    </p>
                                )}
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

function resolveLeaflet(
    leafletModule: typeof import('leaflet'),
): typeof Leaflet {
    const moduleWithDefault =
        leafletModule as typeof import('leaflet') & {
            default?: typeof Leaflet;
        };

    return (
        moduleWithDefault.default ??
        (leafletModule as unknown as
            typeof Leaflet)
    );
}

function layerToGeometry(
    layer: Leaflet.Layer,
): ServiceAreaGeoJson | null {
    if (
        !(
            'toGeoJSON' in layer &&
            typeof layer.toGeoJSON ===
            'function'
        )
    ) {
        return null;
    }

    const geoJson =
        layer.toGeoJSON();

    if (geoJson.type !== 'Feature') {
        return null;
    }

    const geometry =
        geoJson.geometry;

    if (
        geometry.type === 'Polygon'
    ) {
        return {
            type: 'Polygon',

            coordinates:
                geometry.coordinates as number[][][],
        };
    }

    if (
        geometry.type ===
        'MultiPolygon'
    ) {
        return {
            type: 'MultiPolygon',

            coordinates:
                geometry.coordinates as number[][][][],
        };
    }

    return null;
}

function getAreaClientId(
    area: RepairShopServiceAreaFormData,
): string {
    if (area.client_id) {
        return area.client_id;
    }

    if (area.id) {
        return `service-area-persisted-${area.id}`;
    }

    /*
     * این حالت فقط برای داده‌های قدیمی است.
     * محدوده‌های جدید باید هنگام ساخت client_id
     * دریافت کنند.
     */
    return `service-area-fallback-${area.sort_order}`;
}

function createClientId(
    prefix: string,
): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID ===
        'function'
    ) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}

function localizeDrawControls(
    L: typeof Leaflet,
): void {
    L.drawLocal.draw.toolbar.buttons.polygon =
        'رسم محدوده خدمات';

    L.drawLocal.edit.toolbar.buttons.edit =
        'ویرایش محدوده‌ها';

    L.drawLocal.edit.toolbar.buttons.remove =
        'حذف محدوده‌ها';

    L.drawLocal.draw.handlers.polygon.tooltip.start =
        'برای شروع رسم کلیک کنید.';

    L.drawLocal.draw.handlers.polygon.tooltip.cont =
        'برای ادامه رسم کلیک کنید.';

    L.drawLocal.draw.handlers.polygon.tooltip.end =
        'برای پایان روی نقطه اول کلیک کنید.';

    L.drawLocal.edit.handlers.edit.tooltip.text =
        'نقاط محدوده را جابه‌جا کنید.';

    L.drawLocal.edit.handlers.remove.tooltip.text =
        'برای حذف روی محدوده کلیک کنید.';
}
