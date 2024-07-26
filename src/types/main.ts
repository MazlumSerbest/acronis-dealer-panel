type Entity = {
    id: string;
    createdBy: string;
    createdAt: string;
    updatedBy?: string;
    updatedAt?: string;
};

type Path = {
    path: string;
    key: string;
    roles?: string[];
    icon: React.ReactNode;
};

type User = Entity & {
    partnerId?: string;
    acronisTenantId?: string;
    name: string;
    email: string;
    emailVerified?: string;
    active: boolean;
    role: "admin" | "partner";
    partner?: Partner;
};

type Partner = Entity & {
    acronisId?: string;
    application?: Application;
    users?: User[];
    clients?: Client[];
    licenses?: License[];
};

type Client = Entity & {
    partnerId: string;
    acronisId?: string;
    billingDate?: string;
};

type License = Entity & {
    partnerId: string;
    key: string;
    typeSerialNo: string;
    licenseSerialNo: string;
    boughtAt?: string;
    activatedAt?: string;
};

type Application = Entity & {
    partnerId?: string;
    companyType: "business" | "person";
    name: string;
    taxNo: string;
    taxOffice: string;
    email: string;
    phone: string;
    mobile: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    applicationDate: string;
    approvedAt?: string;
    approvedBy?: string;
};
