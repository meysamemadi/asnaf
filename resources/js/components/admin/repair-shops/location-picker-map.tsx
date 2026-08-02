import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {LocateFixed, MapPin} from 'lucide-react';

import {Button} from '@/components/ui/button';

interface LocationPickerMapProps {
    latitude: number | null;
    longitude: number | null;

    viewLatitude: number | null;
    viewLongitude: number | null;
    viewZoom: number | null;

    onChange: (
        latitude: number,
        longitude: number,
    ) => void;
}

const DEFAULT_LOCATION: [number, number] = [
    32.4279,
    53.688,
];

export default function LocationPickerMap({
                                              latitude,
                                              longitude,
                                              viewLatitude,
                                              viewLongitude,
                                              viewZoom,
                                              onChange,
                                          }: LocationPickerMapProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    const mapRef = useRef<
        import('leaflet').Map | null
    >(null);

    const markerRef = useRef<
        import('leaflet').CircleMarker | null
    >(null);

    const leafletRef = useRef<
        typeof import('leaflet') | null
    >(null);

    const onChangeRef = useRef(onChange);

    const [locating, setLocating] =
        useState(false);

    const [locationError, setLocationError] =
        useState<string | null>(null);

    const [mapReady, setMapReady] =
        useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        let cancelled = false;

        const initializeMap = async () => {
            if (
                cancelled ||
                !containerRef.current ||
                mapRef.current
            ) {
                return;
            }

            const L = await import('leaflet');

            if (
                cancelled ||
                !containerRef.current
            ) {
                return;
            }

            leafletRef.current = L;

            const hasLocation =
                latitude !== null &&
                longitude !== null;

            const initialCenter: [
                number,
                number,
            ] = hasLocation
                ? [latitude, longitude]
                : DEFAULT_LOCATION;

            const map = L.map(
                containerRef.current,
                {
                    zoomControl: true,
                    attributionControl: true,
                },
            ).setView(
                initialCenter,
                hasLocation ? 15 : 5,
            );

            L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 19,
                    attribution:
                        '&copy; OpenStreetMap contributors',
                },
            ).addTo(map);

            map.on('click', (event) => {
                const nextLatitude =
                    roundCoordinate(
                        event.latlng.lat,
                    );

                const nextLongitude =
                    roundCoordinate(
                        event.latlng.lng,
                    );

                onChangeRef.current(
                    nextLatitude,
                    nextLongitude,
                );
            });

            mapRef.current = map;
            setMapReady(true);

            window.setTimeout(() => {
                map.invalidateSize();
            }, 100);
        };

        initializeMap();

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

    useEffect(() => {
        const map = mapRef.current;

        if (
            !mapReady ||
            !map ||
            viewLatitude === null ||
            viewLongitude === null ||
            !Number.isFinite(viewLatitude) ||
            !Number.isFinite(viewLongitude)
        ) {
            return;
        }

        map.flyTo(
            [
                viewLatitude,
                viewLongitude,
            ],
            viewZoom ?? 13,
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
    ]);

    useEffect(() => {
        const L = leafletRef.current;
        const map = mapRef.current;

        if (
            !mapReady ||
            !L ||
            !map ||
            latitude === null ||
            longitude === null
        ) {
            markerRef.current?.remove();
            markerRef.current = null;

            return;
        }

        const position: [number, number] = [
            latitude,
            longitude,
        ];

        if (!markerRef.current) {
            markerRef.current = L.circleMarker(
                position,
                {
                    radius: 9,
                    weight: 3,
                    fillOpacity: 0.85,
                },
            ).addTo(map);
        } else {
            markerRef.current.setLatLng(
                position,
            );
        }

        map.flyTo(
            position,
            Math.max(
                map.getZoom(),
                15,
            ),
            {
                animate: true,
                duration: 0.5,
            },
        );
    }, [mapReady,
        latitude,
        longitude]);


    const locateUser = () => {
        if (!navigator.geolocation) {
            setLocationError(
                'مکان‌یابی در این مرورگر در دسترس نیست.',
            );

            return;
        }

        setLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChange(
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
                setLocationError(
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

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4"/>

                    برای تعیین محل تعمیرگاه روی
                    نقشه کلیک کنید.
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={locating}
                    onClick={locateUser}
                >
                    <LocateFixed className="size-4"/>

                    {locating
                        ? 'در حال مکان‌یابی...'
                        : 'موقعیت فعلی'}
                </Button>
            </div>

            <div
                ref={containerRef}
                className="h-[420px] w-full overflow-hidden rounded-lg border bg-muted"
            />

            {locationError && (
                <p className="text-sm text-destructive">
                    {locationError}
                </p>
            )}
        </div>
    );
}

function roundCoordinate(
    value: number,
): number {
    return Number(value.toFixed(7));
}
