<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CityResource;
use App\Models\Province;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProvinceCityController extends Controller
{
    /**
     * شهرهای فعال یک استان
     */
    public function index(
        Province $province,
    ): AnonymousResourceCollection {
        abort_unless(
            $province->is_active,
            404,
        );

        $cities = $province
            ->cities()
            ->select([
                'id',
                'province_id',
                'name',
                'slug',
                'code',
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

        return CityResource::collection(
            $cities,
        );
    }
}
