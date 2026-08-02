import {
    useEffect,
    useRef,
    useState,
} from 'react';
import type * as Leaflet from 'leaflet';
import {
    LocateFixed,
    MapPin,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface MapCenterPickerProps {
    /*
     * نقطه‌ای که واقعاً در فرم ذخیره می‌شود.
     */
    latitude: number | null;
    longitude: number | null;
    zoom: number;

    /*
     * مرکز موقت نمایش نقشه؛ مثلاً مرکز استان
     * هنگام ثبت یک شهر جدید.
     */
    viewLatitude?: number | null;
    viewLongitude?: number | null;
    viewZoom?: number | null;

    label?: string;

    onChange: (
        latitude: number,
        longitude: number,
    ) => void;

    onClear: () => void;
}

const DEFAULT_CENTER: [number, number] = [
    32.4279,
    53.688,
];

export default function MapCenterPicker({
                                            latitude,
                                            longitude,
                                            zoom,

                                            viewLatitude = null,
                                            viewLongitude = null,
                                            viewZoom = null,

                                            label = 'برای انتخاب مرکز روی نقشه کلیک کنید.',

                                            onChange,
                                            onClear,
                                        }: MapCenterPickerProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    const mapRef =
        useRef<Leaflet.Map | null>(null);

    const markerRef =
        useRef<Leaflet.CircleMarker | null>(
            null,
        );

    const leafletRef =
        useRef<typeof Leaflet | null>(null);

    const onChangeRef = useRef(onChange);

    const initialValuesRef = useRef({
        latitude,
        longitude,
        zoom,

        viewLatitude,
        viewLongitude,
        viewZoom,
    });

    const [mapReady, setMapReady] =
        useState(false);

    const [mapError, setMapError] =
        useState<string | null>(null);

    const [locating, setLocating] =
        useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    /*
     * ساخت اولیه نقشه
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
                        await import('leaflet');

                    const L = resolveLeaflet(
                        leafletModule,
                    );

                    if (
                        cancelled ||
                        !containerRef.current
                    ) {
                        return;
                    }

                    leafletRef.current = L;

                    const initial =
                        initialValuesRef.current;

                    const hasPoint =
                        isValidCoordinate(
                            initial.latitude,
                            initial.longitude,
                        );

                    const hasView =
                        isValidCoordinate(
                            initial.viewLatitude,
                            initial.viewLongitude,
                        );

                    let center =
                        DEFAULT_CENTER;

                    let initialZoom = 5;

                    if (hasPoint) {
                        center = [
                            initial.latitude as number,
                            initial.longitude as number,
                        ];

                        initialZoom =
                            normalizeZoom(
                                initial.zoom,
                            );
                    } else if (hasView) {
                        center = [
                            initial.viewLatitude as number,
                            initial.viewLongitude as number,
                        ];

                        initialZoom =
                            normalizeZoom(
                                initial.viewZoom ??
                                initial.zoom,
                            );
                    }

                    const map = L.map(
                        containerRef.current,
                        {
                            zoomControl: true,

                            attributionControl:
                                true,
                        },
                    ).setView(
                        center,
                        initialZoom,
                    );

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            maxZoom: 19,

                            attribution:
                                '&copy; OpenStreetMap contributors',
                        },
                    ).addTo(map);

                    map.on(
                        'click',
                        (
                            event:
                            Leaflet.LeafletMouseEvent,
                        ) => {
                            onChangeRef.current(
                                roundCoordinate(
                                    event.latlng.lat,
                                ),

                                roundCoordinate(
                                    event.latlng.lng,
                                ),
                            );
                        },
                    );

                    mapRef.current = map;

                    setMapReady(true);

                    window.setTimeout(() => {
                        map.invalidateSize();
                    }, 100);
                } catch (error) {
                    console.error(
                        'Map initialization failed:',
                        error,
                    );

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

            markerRef.current?.remove();
            markerRef.current = null;

            mapRef.current?.remove();
            mapRef.current = null;

            leafletRef.current = null;

            setMapReady(false);
        };
    }, []);

    /*
     * نمایش یا جابه‌جایی Marker ذخیره‌شونده
     */
    useEffect(() => {
        const L = leafletRef.current;
        const map = mapRef.current;

        if (!mapReady || !L || !map) {
            return;
        }

        if (
            !isValidCoordinate(
                latitude,
                longitude,
            )
        ) {
            markerRef.current?.remove();
            markerRef.current = null;

            return;
        }

        const position: [number, number] = [
            latitude as number,
            longitude as number,
        ];

        if (!markerRef.current) {
            markerRef.current =
                L.circleMarker(position, {
                    radius: 9,
                    weight: 3,
                    fillOpacity: 0.85,
                }).addTo(map);
        } else {
            markerRef.current.setLatLng(
                position,
            );
        }

        map.flyTo(
            position,
            normalizeZoom(zoom),
            {
                animate: true,
                duration: 0.7,
            },
        );
    }, [
        mapReady,
        latitude,
        longitude,
        zoom,
    ]);

    /*
     * حرکت موقت نقشه روی استان یا منطقه والد.
     * این Effect هیچ مختصاتی را ذخیره نمی‌کند.
     */
    useEffect(() => {
        const map = mapRef.current;

        if (
            !mapReady ||
            !map ||
            !isValidCoordinate(
                viewLatitude,
                viewLongitude,
            )
        ) {
            return;
        }

        map.flyTo(
            [
                viewLatitude as number,
                viewLongitude as number,
            ],
            normalizeZoom(
                viewZoom ?? zoom,
            ),
            {
                animate: true,
                duration: 0.8,
            },
        );
    }, [
        mapReady,
        viewLatitude,
        viewLongitude,
        viewZoom,
        zoom,
    ]);

    const locateUser = (): void => {
        if (!navigator.geolocation) {
            setMapError(
                'مکان‌یابی در این مرورگر پشتیبانی نمی‌شود.',
            );

            return;
        }

        setLocating(true);
        setMapError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChangeRef.current(
                    roundCoordinate(
                        position.coords.latitude,
                    ),

                    roundCoordinate(
                        position.coords.longitude,
                    ),
                );

                setLocating(false);
            },

            () => {
                setMapError(
                    'دسترسی به موقعیت فعلی امکان‌پذیر نبود.',
                );

                setLocating(false);
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
            },
        );
    };

    const hasSelectedCenter =
        isValidCoordinate(
            latitude,
            longitude,
        );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />

                    {label}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={locating}
                        onClick={locateUser}
                    >
                        <LocateFixed className="size-4" />

                        {locating
                            ? 'در حال مکان‌یابی...'
                            : 'موقعیت فعلی'}
                    </Button>

                    {hasSelectedCenter && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClear}
                        >
                            <Trash2 className="size-4" />
                            حذف مرکز
                        </Button>
                    )}
                </div>
            </div>

            {mapError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    {mapError}
                </div>
            )}

            <div
                ref={containerRef}
                className="h-[460px] w-full overflow-hidden rounded-lg border bg-muted"
            />
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

function isValidCoordinate(
    latitude: number | null | undefined,
    longitude: number | null | undefined,
): boolean {
    return (
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
    );
}

function normalizeZoom(
    zoom: number,
): number {
    if (!Number.isFinite(zoom)) {
        return 12;
    }

    return Math.min(
        18,
        Math.max(4, zoom),
    );
}

function roundCoordinate(
    coordinate: number,
): number {
    return Number(
        coordinate.toFixed(7),
    );
}
