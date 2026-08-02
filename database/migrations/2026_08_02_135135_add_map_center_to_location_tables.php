<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provinces', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)
                ->nullable()
                ->after('code');

            $table->decimal('longitude', 10, 7)
                ->nullable()
                ->after('latitude');

            $table->unsignedTinyInteger('map_zoom')
                ->default(8)
                ->after('longitude');
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)
                ->nullable()
                ->after('code');

            $table->decimal('longitude', 10, 7)
                ->nullable()
                ->after('latitude');

            $table->unsignedTinyInteger('map_zoom')
                ->default(12)
                ->after('longitude');
        });

        Schema::table('neighborhoods', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)
                ->nullable()
                ->after('slug');

            $table->decimal('longitude', 10, 7)
                ->nullable()
                ->after('latitude');

            $table->unsignedTinyInteger('map_zoom')
                ->default(15)
                ->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('neighborhoods', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'map_zoom',
            ]);
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'map_zoom',
            ]);
        });

        Schema::table('provinces', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'map_zoom',
            ]);
        });
    }
};
