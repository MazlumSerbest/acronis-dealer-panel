type Entity = {
    id: string;
    active: boolean;
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
    username?: string;
    name: string;
    email: string;
    role: string;
    acronisTenantId: string;
};
