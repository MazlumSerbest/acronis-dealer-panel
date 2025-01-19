type Entity = {
    id?: string;
    createdBy?: string;
    createdAt?: string;
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
    partnerAcronisId?: string;
    acronisTenantId?: string;
    active: boolean;
    name: string;
    email: string;
    emailVerified?: string;
    role: "admin" | "partner";
    licensed: boolean;
    partner?: Partner;
};

type Partner = Entity & {
    // parentId?: string;
    acronisId?: string;
    parentAcronisId?: string;
    applicationId?: string;
    name: string;
    licensed: boolean;
    active?: boolean;
    billingDate?: string;
    application?: Application;
    users?: User[];
    customers?: Customer[];
    licenses?: License[];
    _count?: any;
};

type Customer = Entity & {
    name: string;
    active?: boolean;
    partnerAcronisId: string;
    acronisId?: string;
    billingDate?: string;
};

type License = Entity & {
    productId: string;
    partnerAcronisId?: string;
    customerAcronisId?: string;
    key: string;
    serialNo: string;
    expiresAt?: string;
    activatedAt?: string;
    product?: Product;
};

type LicenseHistory = {
    id: string;
    licenseId: string;
    partnerAcronisId: string;
    previousPartnerAcronisId?: string;
    customerAcronisId?: string;
    action: "firstAssignment" | "assignment" | "activation";
    createdBy: string;
    createdAt: string;
};

type Product = Entity & {
    active: boolean;
    code: string;
    name: string;
    model: "perGB" | "perWorkload";
    quota?: number;
    unit?: "GB" | "TB" | "piece";
    bytes?: bigint;
    edition?: "standart" | "advanced";
};

type Application = Entity & {
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

type Course = Entity & {
    active: boolean;
    category: "panel" | "acronis";
    name: string;
    shortDescription: string;
    description: string;
    duration: string;
    level: string;
    image: string;
    chapters: Chapter[];
};

type Chapter = Entity & {
    active: boolean;
    name: string;
    order: number;
    lessons: Lesson[];
};

type Lesson = Entity & {
    active: boolean;
    name: string;
    description: string;
    order: number;
    link: string;
};

type News = Entity & {
    status: "passive" | "draft" | "active";
    order: number;
    title: string;
    image: string;
    content?: string;
};
