export type ProvinceStatusFilter =
    | 'all'
    | 'active'
    | 'inactive';

export interface ProvinceListItem {
    id: number;

    name: string;
    slug: string;
    code: string | null;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;

    cities_count: number;
    created_at: string | null;
}

export interface EditableProvince {
    id: number;

    name: string;
    slug: string;
    code: string | null;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;
}

export interface ProvinceFormData {
    name: string;
    slug: string;
    code: string;

    latitude: string;
    longitude: string;
    map_zoom: number;

    sort_order: number;
    is_active: boolean;
}

export interface ProvinceFilters {
    search: string;
    status: ProvinceStatusFilter;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedProvinces {
    current_page: number;
    data: ProvinceListItem[];

    first_page_url: string;
    from: number | null;

    last_page: number;
    last_page_url: string;

    links: PaginationLink[];

    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;

    to: number | null;
    total: number;
}
