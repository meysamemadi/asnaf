<?php

use App\Enums\BusinessLicenseStatus;
use App\Enums\RepairShopApprovalStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repair_shops', function (Blueprint $table) {
            $table->id();

            /*
             * اطلاعات دسته‌بندی
             */
            $table->foreignId('primary_category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            /*
             * اطلاعات مکانی مرجع
             *
             * استان از طریق city.province به‌دست می‌آید و
             * نیازی به province_id تکراری نیست.
             */
            $table->foreignId('city_id')
                ->constrained('cities')
                ->restrictOnDelete();

            $table->foreignId('neighborhood_id')
                ->nullable()
                ->constrained('neighborhoods')
                ->nullOnDelete();

            /*
             * اطلاعات اصلی واحد صنفی
             */
            $table->string('name', 180);
            $table->string('slug', 190)->unique();

            $table->string('owner_name', 150);
            $table->string('professional_title', 150)
                ->nullable();

            $table->string('short_description', 500)
                ->nullable();

            $table->longText('description')
                ->nullable();

            /*
             * تصاویر
             */
            $table->string('logo_path')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->string('owner_photo_path')->nullable();

            /*
             * اطلاعات تماس
             */
            $table->string('mobile', 20)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();

            $table->string('email')->nullable();
            $table->string('website')->nullable();

            /*
             * آدرس
             */
            $table->text('address');
            $table->string('postal_code', 20)->nullable();

            /*
             * محل دقیق تعمیرگاه
             *
             * این ستون در MySQL به POINT با SRID 4326
             * تبدیل می‌شود.
             */
            $table->geometry(
                'location',
                subtype: 'point',
                srid: 4326,
            );

            /*
             * اطلاعات صنفی
             */
            $table->string('union_membership_code', 100)
                ->nullable()
                ->unique();

            $table->string('business_license_number', 100)
                ->nullable()
                ->unique();

            $table->date('business_license_issued_at')
                ->nullable();

            $table->date('business_license_expires_at')
                ->nullable();

            $table->string('business_license_status', 20)
                ->default(BusinessLicenseStatus::Pending->value);

            /*
             * وضعیت‌های مدیریتی
             */
            $table->string('approval_status', 20)
                ->default(RepairShopApprovalStatus::Pending->value);

            $table->text('rejection_reason')
                ->nullable();

            $table->boolean('is_union_member')
                ->default(false);

            $table->boolean('is_verified')
                ->default(false);

            $table->boolean('is_featured')
                ->default(false);

            $table->boolean('is_active')
                ->default(true);

            $table->unsignedInteger('sort_order')
                ->default(0);

            $table->timestamp('published_at')
                ->nullable();

            /*
             * امتیازهای محاسبه‌شده از نظرات
             */
            $table->decimal(
                'average_rating',
                total: 3,
                places: 2,
            )->default(0);

            $table->unsignedInteger('reviews_count')
                ->default(0);

            $table->timestamps();
            $table->softDeletes();

            /*
             * ایندکس‌ها
             */
            $table->spatialIndex(
                'location',
                'repair_shops_location_spatial_index',
            );

            $table->index([
                'city_id',
                'is_active',
                'approval_status',
            ]);

            $table->index([
                'primary_category_id',
                'is_active',
            ]);

            $table->index([
                'is_featured',
                'sort_order',
            ]);

            $table->index(
                [
                    'business_license_status',
                    'business_license_expires_at',
                ],
                'rs_license_expiry_idx',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repair_shops');
    }
};
