<?php

use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CityController;
use App\Http\Controllers\Admin\LocationOptionController;
use App\Http\Controllers\Admin\NeighborhoodController;
use App\Http\Controllers\Admin\ProvinceController;
use App\Http\Controllers\Admin\RepairShopController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {


        Route::resource(
            'categories',
            CategoryController::class
        )->except('show');


        /*
 * گزینه‌های وابسته استان، شهر و محله
 */
        Route::get(
            'location-options/provinces/{province}/cities',
            [
                LocationOptionController::class,
                'cities',
            ],
        )
            ->whereNumber('province')
            ->name(
                'location-options.cities',
            );

        Route::get(
            'location-options/cities/{city}/neighborhoods',
            [
                LocationOptionController::class,
                'neighborhoods',
            ],
        )
            ->whereNumber('city')
            ->name(
                'location-options.neighborhoods',
            );

        /*
         * CRUD تعمیرگاه‌ها
         */
        Route::resource(
            'repair-shops',
            RepairShopController::class,
        )
            ->parameters([
                /*
                 * این نام باید با route('repair_shop')
                 * در FormRequest یکسان باشد.
                 */
                'repair-shops' =>
                    'repair_shop',
            ])
            ->except('show');

        Route::resource(
            'brands',
            BrandController::class,
        )->except('show');

        Route::resource(
            'provinces',
            ProvinceController::class,
        )->except('show');

        Route::resource(
            'cities',
            CityController::class,
        )->except('show');

        Route::resource(
            'neighborhoods',
            NeighborhoodController::class,
        )->except('show');


    });


require __DIR__ . '/settings.php';
