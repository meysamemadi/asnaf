<?php

namespace App\Rules;

use App\Support\GeoJson\MultiPolygonGeoJson;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Throwable;

class ValidServiceAreaGeoJson implements ValidationRule
{
    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail,
    ): void {
        if (!is_string($value) && !is_array($value)) {
            $fail(
                'محدوده خدمات باید به فرمت GeoJSON ارسال شود.',
            );

            return;
        }

        try {
            MultiPolygonGeoJson::from($value);
        } catch (Throwable $exception) {
            $fail($exception->getMessage());
        }
    }
}
