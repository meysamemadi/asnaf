<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProvinceResource;
use App\Models\Province;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProvinceController extends Controller
{
    /**
     * فهرست استان‌های فعال
     */
    public function index(): AnonymousResourceCollection
    {
        $provinces = Province::query()
            ->select([
                'id',
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

        return ProvinceResource::collection(
            $provinces,
        );
    }
}
