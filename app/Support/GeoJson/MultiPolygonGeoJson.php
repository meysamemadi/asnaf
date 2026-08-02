<?php

namespace App\Support\GeoJson;

use InvalidArgumentException;
use JsonException;

final class MultiPolygonGeoJson
{
    /**
     * @param array<int, array<int, array<int, array{0: float, 1: float}>>> $coordinates
     */
    private function __construct(
        private readonly array $coordinates,
    ) {
    }

    /**
     * @param string|array<string, mixed> $value
     */
    public static function from(
        string|array $value,
    ): self {
        $geoJson = is_string($value)
            ? self::decode($value)
            : $value;

        /*
         * بعضی کتابخانه‌های نقشه به‌جای Geometry،
         * یک GeoJSON Feature برمی‌گردانند.
         */
        if (($geoJson['type'] ?? null) === 'Feature') {
            $geoJson = $geoJson['geometry'] ?? null;

            if (!is_array($geoJson)) {
                throw new InvalidArgumentException(
                    'ساختار geometry در GeoJSON معتبر نیست.',
                );
            }
        }

        $type = $geoJson['type'] ?? null;
        $coordinates = $geoJson['coordinates'] ?? null;

        if (!in_array($type, ['Polygon', 'MultiPolygon'], true)) {
            throw new InvalidArgumentException(
                'نوع محدوده باید Polygon یا MultiPolygon باشد.',
            );
        }

        if (!is_array($coordinates) || $coordinates === []) {
            throw new InvalidArgumentException(
                'مختصات محدوده خدمات خالی است.',
            );
        }

        /*
         * Polygon را به MultiPolygon تبدیل می‌کنیم تا
         * همه ورودی‌ها ساختار یکسانی داشته باشند.
         */
        if ($type === 'Polygon') {
            $coordinates = [$coordinates];
        }

        $normalizedPolygons = [];

        foreach ($coordinates as $polygonIndex => $polygon) {
            if (!is_array($polygon) || $polygon === []) {
                throw new InvalidArgumentException(
                    sprintf(
                        'چندضلعی شماره %d فاقد حلقه است.',
                        $polygonIndex + 1,
                    ),
                );
            }

            $normalizedRings = [];

            foreach ($polygon as $ringIndex => $ring) {
                if (!is_array($ring) || count($ring) < 4) {
                    throw new InvalidArgumentException(
                        sprintf(
                            'حلقه شماره %d از چندضلعی شماره %d باید حداقل چهار نقطه داشته باشد.',
                            $ringIndex + 1,
                            $polygonIndex + 1,
                        ),
                    );
                }

                $normalizedPoints = [];

                foreach ($ring as $pointIndex => $point) {
                    if (
                        !is_array($point) ||
                        count($point) < 2 ||
                        !is_numeric($point[0] ?? null) ||
                        !is_numeric($point[1] ?? null)
                    ) {
                        throw new InvalidArgumentException(
                            sprintf(
                                'نقطه شماره %d از حلقه شماره %d معتبر نیست.',
                                $pointIndex + 1,
                                $ringIndex + 1,
                            ),
                        );
                    }

                    $longitude = (float) $point[0];
                    $latitude = (float) $point[1];

                    /*
                     * محدوده مجاز MySQL برای SRID 4326
                     */
                    if ($longitude <= -180 || $longitude > 180) {
                        throw new InvalidArgumentException(
                            'طول جغرافیایی باید بزرگ‌تر از ۱۸۰- و کوچک‌تر یا مساوی ۱۸۰ باشد.',
                        );
                    }

                    if ($latitude < -90 || $latitude > 90) {
                        throw new InvalidArgumentException(
                            'عرض جغرافیایی باید بین ۹۰- و ۹۰ باشد.',
                        );
                    }

                    $normalizedPoints[] = [
                        $longitude,
                        $latitude,
                    ];
                }

                $firstPoint = $normalizedPoints[0];
                $lastPoint = $normalizedPoints[
                count($normalizedPoints) - 1
                ];

                if (
                    !self::coordinatesAreEqual(
                        $firstPoint,
                        $lastPoint,
                    )
                ) {
                    throw new InvalidArgumentException(
                        sprintf(
                            'حلقه شماره %d بسته نیست؛ نقطه اول و آخر باید یکسان باشند.',
                            $ringIndex + 1,
                        ),
                    );
                }

                $normalizedRings[] = $normalizedPoints;
            }

            $normalizedPolygons[] = $normalizedRings;
        }

        return new self($normalizedPolygons);
    }

    /**
     * خروجی استاندارد برای ذخیره یا ارسال مجدد به نقشه.
     *
     * @return array{
     *     type: string,
     *     coordinates: array<int, array<int, array<int, array{0: float, 1: float}>>>
     * }
     */
    public function toArray(): array
    {
        return [
            'type' => 'MultiPolygon',
            'coordinates' => $this->coordinates,
        ];
    }

    public function toJson(): string
    {
        return json_encode(
            $this->toArray(),
            JSON_THROW_ON_ERROR |
            JSON_UNESCAPED_UNICODE |
            JSON_PRESERVE_ZERO_FRACTION,
        );
    }

    public function toWkt(): string
    {
        $polygons = array_map(
            function (array $polygon): string {
                $rings = array_map(
                    function (array $ring): string {
                        $points = array_map(
                            fn (array $point): string =>
                                self::formatNumber($point[0])
                                . ' '
                                . self::formatNumber($point[1]),
                            $ring,
                        );

                        return '(' . implode(',', $points) . ')';
                    },
                    $polygon,
                );

                return '(' . implode(',', $rings) . ')';
            },
            $this->coordinates,
        );

        return 'MULTIPOLYGON('
            . implode(',', $polygons)
            . ')';
    }

    /**
     * @return array<string, mixed>
     */
    private static function decode(string $value): array
    {
        try {
            $decoded = json_decode(
                $value,
                true,
                512,
                JSON_THROW_ON_ERROR,
            );
        } catch (JsonException) {
            throw new InvalidArgumentException(
                'فرمت JSON محدوده خدمات معتبر نیست.',
            );
        }

        if (!is_array($decoded)) {
            throw new InvalidArgumentException(
                'GeoJSON محدوده خدمات معتبر نیست.',
            );
        }

        return $decoded;
    }

    /**
     * @param array{0: float, 1: float} $first
     * @param array{0: float, 1: float} $second
     */
    private static function coordinatesAreEqual(
        array $first,
        array $second,
    ): bool {
        return
            abs($first[0] - $second[0]) < 0.000000001 &&
            abs($first[1] - $second[1]) < 0.000000001;
    }

    private static function formatNumber(
        float $value,
    ): string {
        $formatted = number_format(
            $value,
            8,
            '.',
            '',
        );

        $formatted = rtrim(
            rtrim($formatted, '0'),
            '.',
        );

        return $formatted === '-0'
            ? '0'
            : $formatted;
    }
}
