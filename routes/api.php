<?php

use App\Http\Controllers\Api\V1\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\CityNeighborhoodController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ProvinceCityController;
use App\Http\Controllers\Api\V1\ProvinceController;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');




Route::prefix('v1')
    ->name('api.v1.')
    ->group(function (): void {
        /*
         * Health
         */
        Route::get(
            '/health',
            HealthController::class,
        )->name('health');

        /*
         * Categories
         */
        Route::get(
            '/categories',
            [
                CategoryController::class,
                'index',
            ],
        )->name(
            'categories.index',
        );

        Route::get(
            '/categories/{category:slug}',
            [
                CategoryController::class,
                'show',
            ],
        )->name(
            'categories.show',
        );

        /*
         * Locations
         */
        Route::get(
            '/provinces',
            [
                ProvinceController::class,
                'index',
            ],
        )->name(
            'provinces.index',
        );

        Route::get(
            '/provinces/{province}/cities',
            [
                ProvinceCityController::class,
                'index',
            ],
        )
            ->whereNumber('province')
            ->name(
                'provinces.cities.index',
            );

        Route::get(
            '/cities/{city}/neighborhoods',
            [
                CityNeighborhoodController::class,
                'index',
            ],
        )
            ->whereNumber('city')
            ->name(
                'cities.neighborhoods.index',
            );
    });
