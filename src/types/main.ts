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
    partnerId?: string;
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
    active?: boolean;
    billingDate?: string;
    application?: Application;
    users?: User[];
    customers?: Customer[];
    licenses?: License[];
};

type Customer = Entity & {
    name: string;
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

type Product = Entity & {
    code: string;
    name: string;
    model: "perGB" | "perWorkload";
    quota?: number;
    unit?: "MB" | "GB" | "TB" | "piece";
    bytes?: bigint;
    edition?: "standart" | "advanced"
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
