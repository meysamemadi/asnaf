export type CityStatusFilter =
    | 'all'
    | 'active'
    | 'inactive';

export interface CityProvinceOption {
    id: number;
    name: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    is_active: boolean;
}

export interface CityProvinceSummary {
    id: number;
    name: string;
    is_active: boolean;
}

export interface CityListItem {
    id: number;

    province_id: number;
    province: CityProvinceSummary | null;

    name: string;
    slug: string;
    code: string | null;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;

    neighborhoods_count: number;
    repair_shops_count: number;

    created_at: string | null;
}

export interface EditableCity {
    id: number;

    province_id: number;

    name: string;
    slug: string;
    code: string | null;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;
}

export interface CityFormData {
    province_id: number | null;

    name: string;
    slug: string;
    code: string;

    latitude: string;
    longitude: string;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;
}

export interface CityFilters {
    search: string;
    province_id: number | null;
    status: CityStatusFilter;
}

export interface CityPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedCities {
    current_page: number;
    data: CityListItem[];

    first_page_url: string;
    from: number | null;

    last_page: number;
    last_page_url: string;

    links: CityPaginationLink[];

    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;

    to: number | null;
    total: number;
}
