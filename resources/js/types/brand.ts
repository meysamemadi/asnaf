export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_path: string | null;
    logo_url: string | null;
    website: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string | null;
}

export interface EditableBrand {
    id: number;
    name: string;
    slug: string;
    logo_path: string | null;
    logo_url: string | null;
    description: string | null;
    website: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface BrandFormData {
    name: string;
    slug: string;
    logo: File | null;
    remove_logo: boolean;
    description: string;
    website: string;
    sort_order: number;
    is_active: boolean;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedBrands {
    current_page: number;
    data: Brand[];
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
