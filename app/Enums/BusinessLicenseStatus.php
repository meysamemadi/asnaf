<?php

namespace App\Enums;

enum BusinessLicenseStatus: string
{
    case Pending = 'pending';
    case Valid = 'valid';
    case Expired = 'expired';
    case Suspended = 'suspended';
    case Revoked = 'revoked';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'در انتظار بررسی',
            self::Valid => 'معتبر',
            self::Expired => 'منقضی‌شده',
            self::Suspended => 'تعلیق‌شده',
            self::Revoked => 'باطل‌شده',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            self::cases(),
        );
    }
}
