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

type User = Entity & {
    username: string;
    name: string;
    email: string;
    acronisTenantUUID: string;
};
