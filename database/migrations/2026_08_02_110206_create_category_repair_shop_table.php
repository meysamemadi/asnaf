<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'category_repair_shop',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId('repair_shop_id')
                    ->constrained('repair_shops')
                    ->cascadeOnDelete();

                $table->foreignId('category_id')
                    ->constrained('categories')
                    ->cascadeOnDelete();

                $table->boolean('is_active')
                    ->default(true);

                $table->unsignedInteger('sort_order')
                    ->default(0);

                $table->timestamps();

                $table->unique([
                    'repair_shop_id',
                    'category_id',
                ]);

                $table->index([
                    'category_id',
                    'is_active',
                ]);
            },
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'category_repair_shop',
        );
    }
};
