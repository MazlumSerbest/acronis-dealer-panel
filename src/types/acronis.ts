// V2
type AcronisEntity = {
    id: string;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
};

type Tenant = AcronisEntity & {
    parent_id: string;
    enabled: boolean;
    name: string;
    kind: string;
    language: string;
    customer_id: string;
    customer_type: string;
    contact: TenantContact;
    contacts: TenantContact[];
    pricing_mode: string;
    has_children: boolean;
};

type TenantUser = AcronisEntity & {
    tenant_id: string;
    login: string;
    activated: boolean;
    enabled: boolean;
    mfa_status: string;
    language: string;
    contact: TenantContact;
};

type TenantContact = AcronisEntity & {
    aan: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    state: string;
    zipcode: string;
    firstname: string;
    lastname: string;
    fullname: string;
    email: string;
    email_confirmed: string;
    phone: string;
    fax: string;
    website: string;
    language: string;
    industry: string;
    organization_size: string;
    title: string;
    types: Array<"legal" | "billing" | "technical" | "business">;
    tenant_id: string;
    user_id: string;
};

type TenantLocation = AcronisEntity & {
    owner_tenant_id: string;
    platform_owned: boolean;
    name: string;
};

type TenantUsage = {
    tenant_uuid: string;
    tenant_id: number;
    application_id: string;
    name: string;
    edition: string;
    usage_name: string;
    range_start: string;
    absolute_value: number;
    value: number;
    type: string;
    measurement_unit: "quantity" | "bytes";
    infra_id: string;
    offering_item?: {
        status: number;
        quota?: {
            value: number;
            overage: number;
            version: number;
        };
    };
};

// V1
type Alert = {
    id: string;
    type: string;
    severity: string;
    details: AlertDetail;
    category: string;
    tenant: {
        id: number;
        uuid: string;
    };
    createdAt: string;
    receivedAt: string;
    updatedAt: string;
};

type AlertDetail = {
    actionTaken: string;
    planId: string;
    planName: string;
    resourceId: string;
    resourceName: string;
};
