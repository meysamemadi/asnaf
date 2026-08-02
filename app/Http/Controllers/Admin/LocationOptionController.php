<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Province;
use App\Support\RepairShops\RepairShopFormOptions;
use Illuminate\Http\JsonResponse;

class LocationOptionController extends Controller
{
    public function __construct(
        private readonly RepairShopFormOptions $formOptions,
    ) {
    }

    public function cities(
        Province $province,
    ): JsonResponse {
        return response()->json([
            'data' => $this->formOptions
                ->citiesForProvince($province->id),
        ]);
    }

    public function neighborhoods(
        City $city,
    ): JsonResponse {
        return response()->json([
            'data' => $this->formOptions
                ->neighborhoodsForCity($city->id),
        ]);
    }
}
