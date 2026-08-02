<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('province_id')
                ->constrained('provinces')
                ->restrictOnDelete();

            $table->string('name', 100);
            $table->string('slug', 120);

            $table->string('code', 20)
                ->nullable()
                ->unique();

            $table->unsignedSmallInteger('sort_order')
                ->default(0);

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            /*
             * ممکن است دو استان شهرهایی با نام یا slug مشابه
             * داشته باشند؛ یکتایی در سطح هر استان کنترل می‌شود.
             */
            $table->unique([
                'province_id',
                'slug',
            ]);

            $table->index([
                'province_id',
                'is_active',
                'sort_order',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
