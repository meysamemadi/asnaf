<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');


use App\Http\Controllers\Api\V1\HealthController;


Route::prefix('v1')
    ->name('api.v1.')
    ->group(function (): void {
        Route::get(
            '/health',
            HealthController::class,
        )->name('health');
    });
