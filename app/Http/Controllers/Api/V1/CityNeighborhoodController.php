<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\NeighborhoodResource;
use App\Models\City;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CityNeighborhoodController extends Controller
{
    /**
     * محله‌های فعال یک شهر
     */
    public function index(
        City $city,
    ): AnonymousResourceCollection {
        $city->loadMissing([
            'province:id,is_active',
        ]);

        abort_unless(
            $city->is_active &&
            $city->province?->is_active,
            404,
        );

        $neighborhoods = $city
            ->neighborhoods()
            ->select([
                'id',
                'city_id',
                'name',
                'slug',
                'latitude',
                'longitude',
                'map_zoom',
                'sort_order',
            ])
            ->where(
                'is_active',
                true,
            )
            ->orderBy(
                'sort_order',
            )
            ->orderBy(
                'name',
            )
            ->get();

        return NeighborhoodResource::collection(
            $neighborhoods,
        );
    }
}
