<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'repair_shop_service_areas',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId('repair_shop_id')
                    ->constrained('repair_shops')
                    ->cascadeOnDelete();

                $table->string('name', 150);

                /*
                 * محدوده می‌تواند از یک یا چند Polygon
                 * تشکیل شده باشد.
                 */
                $table->geometry(
                    'area',
                    subtype: 'multipolygon',
                    srid: 4326,
                );

                $table->text('description')
                    ->nullable();

                $table->boolean('is_active')
                    ->default(true);

                $table->unsignedInteger('sort_order')
                    ->default(0);

                $table->timestamps();

                $table->spatialIndex(
                    'area',
                    'rsa_area_spatial_idx',
                );


                $table->index(
                    [
                        'repair_shop_id',
                        'is_active',
                        'sort_order',
                    ],
                    'rsa_shop_active_sort_idx',
                );
            },
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'repair_shop_service_areas',
        );
    }
};
