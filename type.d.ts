type Entity = {
    id: number;
    active: boolean;
    createdBy: string;
    createdAt: string;
    updatedBy?: string;
    updatedAt?: string;
};

type Path = {
    path: string;
    key: string;
    icon: React.ReactNode;
};

//#region COMPONENTS
type ListBoxItem = {
    id: number;
    name: string;
};

// DataTable
type Column = {
    name: string;
    key: string;
    width?: number;
    sortable?: boolean;
    searchable?: boolean;
};

type ActiveOption = {
    name: string;
    key: string;
};
//#endregion

//#region ACRONIS
// V2
interface Tenant {
    id: string;
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
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

interface TenantUser {
    id: string;
    tenant_id: string;
    login: string;
    activated: boolean;
    enabled: boolean;
    mfa_status: string;
    language: string;
    contact: TenantContact;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

interface TenantContact {
    id: string;
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
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    types: Array["legal" | "billing" | "technical" | "business"];
    tenant_id: string;
    user_id: string;
}

// V1
interface Alert {
    id: string;
    type: string;
    severity: string;
    details: AlertDetail;
    category: string;
    tenant: {
        id: number;
        uuid: string;
    };
    createdAt: Date;
    receivedAt: Date;
    updatedAt: Date;
}

interface AlertDetail {
    actionTaken: string;
    planId: string;
    planName: string;
    resourceId: string;
    resourceName: string;
}
//#endregion
