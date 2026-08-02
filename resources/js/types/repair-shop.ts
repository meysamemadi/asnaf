export type RepairShopApprovalStatus =
    | 'pending'
    | 'approved'
    | 'rejected';

export type BusinessLicenseStatus =
    | 'pending'
    | 'valid'
    | 'expired'
    | 'suspended'
    | 'revoked';

export type RepairShopActivityFilter =
    | 'active'
    | 'inactive'
    | null;

export type RepairShopVerificationFilter =
    | 'verified'
    | 'unverified'
    | null;

export type RepairShopFeaturedFilter =
    | 'featured'
    | 'normal'
    | null;

export interface RepairShopCitySummary {
    id: number;
    name: string;
    province_name: string | null;
}

export interface RepairShopCategorySummary {
    id: number;
    name: string;
}

export interface RepairShopListItem {
    id: number;

    name: string;
    slug: string;
    owner_name: string;

    logo_url: string | null;

    mobile: string | null;
    phone: string | null;

    city: RepairShopCitySummary | null;
    primary_category: RepairShopCategorySummary | null;

    approval_status: RepairShopApprovalStatus;
    approval_status_label: string;

    business_license_status: BusinessLicenseStatus;
    business_license_status_label: string;

    is_verified: boolean;
    is_featured: boolean;
    is_active: boolean;

    average_rating: number;
    reviews_count: number;

    categories_count: number;
    agencies_count: number;
    service_areas_count: number;

    sort_order: number;
    created_at: string | null;
}

export interface RepairShopFilters {
    search: string;

    approval_status: RepairShopApprovalStatus | null;
    activity: RepairShopActivityFilter;
    verification: RepairShopVerificationFilter;
    featured: RepairShopFeaturedFilter;

    city_id: number | null;
    category_id: number | null;
}

export interface RepairShopStatusOption<
    TValue extends string = string,
> {
    value: TValue;
    label: string;
}

export interface RepairShopCategoryOption {
    id: number;
    parent_id: number | null;
    name: string;
    label: string;
}

export interface RepairShopCityOption {
    id: number;
    province_id: number;
    name: string;
    label: string;
}

export interface RepairShopFilterOptions {
    categories: RepairShopCategoryOption[];
    cities: RepairShopCityOption[];

    approval_statuses: RepairShopStatusOption<RepairShopApprovalStatus>[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedRepairShops {
    current_page: number;
    data: RepairShopListItem[];

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


export interface RepairShopProvinceOption {
    id: number;
    name: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;
}

export interface RepairShopLocationCityOption {
    id: number;
    province_id: number;
    name: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;
}

export interface RepairShopNeighborhoodOption {
    id: number;
    city_id: number;
    name: string;

    latitude: number | null;
    longitude: number | null;
    map_zoom: number;
}

export interface RepairShopBrandOption {
    id: number;
    name: string;
}

export interface RepairShopFormOptions {
    categories: RepairShopCategoryOption[];
    brands: RepairShopBrandOption[];
    provinces: RepairShopProvinceOption[];

    approval_statuses: RepairShopStatusOption<RepairShopApprovalStatus>[];

    business_license_statuses: RepairShopStatusOption<BusinessLicenseStatus>[];

    agency_statuses: RepairShopStatusOption<AgencyStatus>[];
}

export type AgencyStatus =
    | 'pending'
    | 'active'
    | 'expired'
    | 'suspended';

export interface RepairShopAgencyFormData {
    client_id?: string;

    brand_id: number | null;
    brand_name?: string | null;

    certificate_number: string;
    certificate: File | null;

    certificate_path?: string | null;
    certificate_url?: string | null;

    remove_certificate: boolean;

    issued_at: string;
    expires_at: string;

    status: AgencyStatus;
    is_official: boolean;

    notes: string;
}

export interface GeoJsonPolygon {
    type: 'Polygon';
    coordinates: number[][][];
}

export interface GeoJsonMultiPolygon {
    type: 'MultiPolygon';
    coordinates: number[][][][];
}

export type ServiceAreaGeoJson =
    | GeoJsonPolygon
    | GeoJsonMultiPolygon;

export interface RepairShopServiceAreaFormData {
    client_id?: string;
    id?: number;

    name: string;
    geojson: ServiceAreaGeoJson;

    description: string;
    is_active: boolean;
    sort_order: number;
}

export interface RepairShopFormData {
    name: string;
    slug: string;

    owner_name: string;
    professional_title: string;

    short_description: string;
    description: string;

    primary_category_id: number | null;
    category_ids: number[];

    province_id: number | null;
    city_id: number | null;
    neighborhood_id: number | null;

    address: string;
    postal_code: string;

    latitude: string;
    longitude: string;

    mobile: string;
    phone: string;
    whatsapp: string;
    email: string;
    website: string;

    logo: File | null;
    cover_image: File | null;
    owner_photo: File | null;

    remove_logo: boolean;
    remove_cover_image: boolean;
    remove_owner_photo: boolean;

    union_membership_code: string;

    business_license_number: string;
    business_license_issued_at: string;
    business_license_expires_at: string;
    business_license_status: BusinessLicenseStatus;

    approval_status: RepairShopApprovalStatus;
    rejection_reason: string;

    is_union_member: boolean;
    is_verified: boolean;
    is_featured: boolean;
    is_active: boolean;

    sort_order: number;
    published_at: string;

    agencies: RepairShopAgencyFormData[];
    service_areas: RepairShopServiceAreaFormData[];
}

export interface EditableRepairShop {
    id: number;

    name: string;
    slug: string;

    owner_name: string;
    professional_title: string | null;

    short_description: string | null;
    description: string | null;

    primary_category_id: number | null;
    category_ids: number[];

    province_id: number | null;
    city_id: number;
    neighborhood_id: number | null;

    address: string;
    postal_code: string | null;

    latitude: number;
    longitude: number;

    mobile: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;

    logo_path: string | null;
    logo_url: string | null;

    cover_image_path: string | null;
    cover_image_url: string | null;

    owner_photo_path: string | null;
    owner_photo_url: string | null;

    union_membership_code: string | null;

    business_license_number: string | null;
    business_license_issued_at: string | null;
    business_license_expires_at: string | null;
    business_license_status: BusinessLicenseStatus;

    approval_status: RepairShopApprovalStatus;
    rejection_reason: string | null;

    is_union_member: boolean;
    is_verified: boolean;
    is_featured: boolean;
    is_active: boolean;

    sort_order: number;
    published_at: string | null;

    agencies: Array<{
        brand_id: number;
        brand_name: string | null;

        certificate_number: string | null;
        certificate_path: string | null;
        certificate_url: string | null;

        issued_at: string | null;
        expires_at: string | null;

        status: AgencyStatus;
        is_official: boolean;

        notes: string | null;
    }>;

    service_areas: Array<{
        id: number;
        name: string;

        geojson: ServiceAreaGeoJson;

        description: string | null;
        is_active: boolean;
        sort_order: number;
    }>;
}
