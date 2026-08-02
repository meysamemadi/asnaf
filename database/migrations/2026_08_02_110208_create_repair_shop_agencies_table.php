<?php

use App\Enums\AgencyStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'repair_shop_agencies',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId('repair_shop_id')
                    ->constrained('repair_shops')
                    ->cascadeOnDelete();

                $table->foreignId('brand_id')
                    ->constrained('brands')
                    ->restrictOnDelete();

                $table->string('certificate_number', 120)
                    ->nullable();

                $table->string('certificate_path')
                    ->nullable();

                $table->date('issued_at')
                    ->nullable();

                $table->date('expires_at')
                    ->nullable();

                $table->string('status', 20)
                    ->default(AgencyStatus::Pending->value);

                $table->boolean('is_official')
                    ->default(false);

                $table->text('notes')
                    ->nullable();

                $table->timestamps();

                $table->unique([
                    'repair_shop_id',
                    'brand_id',
                ]);

                $table->index([
                    'brand_id',
                    'status',
                    'is_official',
                ]);

                $table->index([
                    'expires_at',
                    'status',
                ]);
            },
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'repair_shop_agencies',
        );
    }
};
