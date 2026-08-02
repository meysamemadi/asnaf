export type NeighborhoodStatusFilter =
    | 'all'
    | 'active'
    | 'inactive';

export interface NeighborhoodProvinceOption {
    id: number;
    name: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    is_active: boolean;
}

export interface NeighborhoodCityOption {
    id: number;
    province_id: number;
    name: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    is_active: boolean;
}

export interface NeighborhoodProvinceSummary {
    id: number;
    name: string;
    is_active: boolean;
}

export interface NeighborhoodCitySummary {
    id: number;
    name: string;
    is_active: boolean;

    province: NeighborhoodProvinceSummary | null;
}

export interface NeighborhoodListItem {
    id: number;
    city_id: number;

    city: NeighborhoodCitySummary | null;

    name: string;
    slug: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;

    repair_shops_count: number;

    created_at: string | null;
}

export interface EditableNeighborhood {
    id: number;

    province_id: number;
    city_id: number;

    name: string;
    slug: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;
}

export interface NeighborhoodFormData {
    /*
     * province_id برای انتخاب و اعتبارسنجی است
     * و مستقیماً در جدول neighborhoods ذخیره نمی‌شود.
     */
    province_id: number | null;
    city_id: number | null;

    name: string;
    slug: string;

    latitude: string;
    longitude: string;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;
}

export interface NeighborhoodFilters {
    search: string;

    province_id: number | null;
    city_id: number | null;

    status: NeighborhoodStatusFilter;
}

export interface NeighborhoodPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedNeighborhoods {
    current_page: number;
    data: NeighborhoodListItem[];

    first_page_url: string;
    from: number | null;

    last_page: number;
    last_page_url: string;

    links: NeighborhoodPaginationLink[];

    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;

    to: number | null;
    total: number;
}
