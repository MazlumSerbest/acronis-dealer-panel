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

interface TenantContact {

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