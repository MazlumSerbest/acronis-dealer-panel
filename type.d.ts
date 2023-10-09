interface Path {
    path: string;
    key: string;
    icon: React.ReactNode;
}

// ACRONIS
// V2
interface Tenant {
    id: string;
    enabled: boolean;
    name: string;
    kind: string;
    parent_id: string;
    contact: TenantContact;
    contacts: TenantContact[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

interface TenantUser{
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
    title: string;
    aan: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    state: string;
    zipcode: string;
    firstname: string;
    lastname: string;
    email: string;
    email_confirmed: string;
    phone: string;
    fax: string;
    website: string;
    language: string;
    industry: string;
    organization_size: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
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
    }
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