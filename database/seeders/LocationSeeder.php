<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Province;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $gilan = Province::query()->updateOrCreate(
            [
                'slug' => 'gilan',
            ],
            [
                'name' => 'گیلان',
                'code' => '01',

                /*
                 * مرکز نمایشی تقریبی استان
                 */
                'latitude' => 37.2800000,
                'longitude' => 49.5900000,
                'map_zoom' => 8,

                'sort_order' => 1,
                'is_active' => true,
            ],
        );

        $rasht = City::query()->updateOrCreate(
            [
                'province_id' => $gilan->id,
                'slug' => 'rasht',
            ],
            [
                'name' => 'رشت',
                'code' => '013',

                /*
                 * مرکز نمایشی تقریبی شهر
                 */
                'latitude' => 37.2682000,
                'longitude' => 49.5891000,
                'map_zoom' => 12,

                'sort_order' => 1,
                'is_active' => true,
            ],
        );

        Neighborhood::query()->updateOrCreate(
            [
                'city_id' => $rasht->id,
                'slug' => 'golsar',
            ],
            [
                'name' => 'گلسار',

                /*
                 * مرکز نمایشی تقریبی محله
                 */
                'latitude' => 37.3030000,
                'longitude' => 49.5845000,
                'map_zoom' => 15,

                'sort_order' => 1,
                'is_active' => true,
            ],
        );
    }
}
