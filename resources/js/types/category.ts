
export type CategoryIconLibrary = 'lu' | 'tb' | 'pi';

export interface CategoryParent {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;

    icon: string | null;
    icon_library: CategoryIconLibrary | null;

    description: string | null;
    sort_order: number;
    is_active: boolean;
    children_count: number;
    parent: CategoryParent | null;
}

export interface EditableCategory {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;

    icon: string | null;
    icon_library: CategoryIconLibrary | null;

    description: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface CategoryFormData {
    parent_id: number | null;
    name: string;
    slug: string;

    icon: string;
    icon_library: CategoryIconLibrary | '';

    description: string;
    sort_order: number;
    is_active: boolean;
}

export interface ParentOption {
    id: number;
    parent_id: number | null;
    name: string;
}

export interface CategoryIconOption {
    value: string;
    label: string;
    library: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedCategories {
    current_page: number;
    data: Category[];
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
