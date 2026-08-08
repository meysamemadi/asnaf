import { useMemo } from 'react';

import DatePickerImport from 'react-multi-date-picker';

import TimePickerImport from 'react-multi-date-picker/plugins/time_picker';

import DateObjectImport from 'react-date-object';

import gregorianImport from 'react-date-object/calendars/gregorian';
import persianImport from 'react-date-object/calendars/persian';

import gregorianEnImport from 'react-date-object/locales/gregorian_en';
import persianFaImport from 'react-date-object/locales/persian_fa';

/*
 * Vite 8 ممکن است default export بعضی پکیج‌ها را
 * به شکل:
 *
 * {
 *     default: Component
 * }
 *
 * برگرداند.
 *
 * این تابع هم حالت استاندارد و هم حالت wrapped
 * را پشتیبانی می‌کند.
 */
function unwrapDefaultExport<T>(
    value: T,
): T {
    let resolved: unknown = value;

    for (let index = 0; index < 3; index++) {
        if (
            typeof resolved === 'object' &&
            resolved !== null &&
            'default' in resolved
        ) {
            resolved = (
                resolved as {
                    default: unknown;
                }
            ).default;

            continue;
        }

        break;
    }

    return resolved as T;
}

const DatePicker =
    unwrapDefaultExport(
        DatePickerImport,
    );

const TimePicker =
    unwrapDefaultExport(
        TimePickerImport,
    );

const DateObject =
    unwrapDefaultExport(
        DateObjectImport,
    );

const gregorian =
    unwrapDefaultExport(
        gregorianImport,
    );

const persian =
    unwrapDefaultExport(
        persianImport,
    );

const gregorian_en =
    unwrapDefaultExport(
        gregorianEnImport,
    );

const persian_fa =
    unwrapDefaultExport(
        persianFaImport,
    );

interface PersianDatePickerProps {
    id?: string;

    /*
     * مقدار داخلی فرم همیشه میلادی است:
     *
     * 2026-08-08
     *
     * یا:
     *
     * 2026-08-08T14:30
     */
    value: string;

    onChange: (
        value: string,
    ) => void;

    placeholder?: string;

    disabled?: boolean;

    /*
     * false:
     * فقط تاریخ
     *
     * true:
     * تاریخ + ساعت
     */
    withTime?: boolean;
}

export default function PersianDatePicker({
                                              id,
                                              value,
                                              onChange,
                                              placeholder = 'تاریخ را انتخاب کنید',
                                              disabled = false,
                                              withTime = false,
                                          }: PersianDatePickerProps) {
    const pickerValue =
        useMemo(() => {
            if (!value) {
                return null;
            }

            try {
                const normalizedValue =
                    withTime
                        ? normalizeDateTime(
                            value,
                        )
                        : value;

                const date =
                    new DateObject({
                        date: normalizedValue,

                        format: withTime
                            ? 'YYYY-MM-DD HH:mm'
                            : 'YYYY-MM-DD',

                        calendar:
                        gregorian,

                        locale:
                        gregorian_en,
                    });

                return date.convert(
                    persian,
                    persian_fa,
                );
            } catch (error) {
                console.error(
                    'PersianDatePicker parse error:',
                    error,
                );

                return null;
            }
        }, [
            value,
            withTime,
        ]);

    return (
        <DatePicker
            id={id}

            value={pickerValue}

            calendar={persian}

            locale={persian_fa}

            format={
                withTime
                    ? 'YYYY/MM/DD HH:mm'
                    : 'YYYY/MM/DD'
            }

            calendarPosition="bottom-right"

            placeholder={placeholder}

            disabled={disabled}

            editable

            zIndex={1000}

            containerClassName="w-full"

            inputClass="
                flex
                h-9
                w-full
                rounded-md
                border
                border-input
                bg-transparent
                px-3
                py-1
                text-sm
                shadow-xs
                outline-none
                transition-[color,box-shadow]
                placeholder:text-muted-foreground
                focus-visible:border-ring
                focus-visible:ring-[3px]
                focus-visible:ring-ring/50
                disabled:pointer-events-none
                disabled:cursor-not-allowed
                disabled:opacity-50
            "

            plugins={
                withTime
                    ? [
                        <TimePicker
                            key="time-picker"
                            position="bottom"
                            hideSeconds
                        />,
                    ]
                    : []
            }

            onChange={(
                selectedDate,
            ) => {
                if (
                    !selectedDate ||
                    Array.isArray(
                        selectedDate,
                    )
                ) {
                    onChange('');

                    return;
                }

                /*
                 * DatePicker به کاربر تاریخ شمسی
                 * نمایش می‌دهد.
                 *
                 * قبل از ارسال به فرم Laravel
                 * تاریخ دوباره به میلادی تبدیل می‌شود.
                 */
                const gregorianDate =
                    new DateObject(
                        selectedDate,
                    ).convert(
                        gregorian,
                        gregorian_en,
                    );

                const datePart =
                    gregorianDate.format(
                        'YYYY-MM-DD',
                    );

                if (!withTime) {
                    onChange(
                        datePart,
                    );

                    return;
                }

                const timePart =
                    gregorianDate.format(
                        'HH:mm',
                    );

                onChange(
                    `${datePart}T${timePart}`,
                );
            }}
        />
    );
}

function normalizeDateTime(
    value: string,
): string {
    return value
        .replace(
            'T',
            ' ',
        )
        .slice(
            0,
            16,
        );
}
