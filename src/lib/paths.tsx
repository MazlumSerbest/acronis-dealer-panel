import {
    LuLayoutDashboard,
    LuHeartHandshake,
    LuKeyRound,
    LuAlertTriangle,
    LuUnplug,
    LuSettings,
    LuUser2,
    LuArchiveRestore,
    LuBriefcase,
    LuFileKey,
    LuKey,
    LuPackage,
    LuGraduationCap,
} from "react-icons/lu";

export const adminPaths: Path[] = [
    {
        path: "/panel",
        key: "panel",
        icon: (
            <LuLayoutDashboard
                className="size-6 group-hover:text-blue-400"
                aria-label="Dashboard"
            />
        ),
    },
    {
        path: "/panel/tenants",
        key: "tenants",
        icon: (
            <LuHeartHandshake
                className="size-6 group-hover:text-blue-400"
                aria-label="Tenants Page"
            />
        ),
    },
    {
        path: "/panel/licenses",
        key: "licenses",
        icon: (
            <LuKey
                className="size-6 group-hover:text-blue-400"
                aria-label="Licenses Page"
            />
        ),
    },
    {
        path: "/panel/products",
        key: "products",
        icon: (
            <LuPackage
                className="size-6 group-hover:text-blue-400"
                aria-label="Products Page"
            />
        ),
    },
    {
        path: "/panel/applications",
        key: "applications",
        icon: (
            <LuArchiveRestore
                className="size-6 group-hover:text-blue-400"
                aria-label="Applications Page"
            />
        ),
    },
    {
        path: "/panel/partners",
        key: "partners",
        icon: (
            <LuBriefcase
                className="size-6 group-hover:text-blue-400"
                aria-label="Partners Page"
            />
        ),
    },
    {
        path: "/panel/users",
        key: "users",
        roles: ["admin"],
        icon: (
            <LuUser2
                className="size-6 group-hover:text-blue-400"
                aria-label="Users Page"
            />
        ),
    },
    {
        path: "/panel/courses",
        key: "courses",
        icon: (
            <LuGraduationCap
                className="size-6 group-hover:text-blue-400"
                aria-label="Courses Page"
            />
        ),
    },
];

export const partnerPaths: Path[] = [
    {
        path: "/panel",
        key: "panel",
        icon: (
            <LuLayoutDashboard
                className="size-6 group-hover:text-blue-400"
                aria-label="Dashboard"
            />
        ),
    },
    {
        path: "/panel/customers",
        key: "customers",
        icon: (
            <LuHeartHandshake
                className="size-6 group-hover:text-blue-400"
                aria-label="Customers Page"
            />
        ),
    },
    {
        path: "/panel/licenses",
        key: "licenses",
        icon: (
            <LuKeyRound
                className="size-6 group-hover:text-blue-400"
                aria-label="Licenses Page"
            />
        ),
    },
    // {
    //     path: "/panel/alerts",
    //     key: "alerts",
    //     icon: (
    //         <LuAlertTriangle
    //             className="size-6 group-hover:text-blue-400"
    //             aria-label="Alerts Page"
    //         />
    //     ),
    // },
    {
        path: "/panel/management",
        key: "management",
        icon: (
            <LuUnplug
                className="size-6 group-hover:text-blue-400"
                aria-label="Management Page"
            />
        ),
    },
    {
        path: "/panel/settings",
        key: "settings",
        icon: (
            <LuSettings
                className="size-6 group-hover:text-blue-400"
                aria-label="Settings Page"
            />
        ),
    },
    // {
    //     path: "/panel/learn",
    //     key: "learn",
    //     icon: (
    //         <LuGraduationCap
    //             className="size-6 group-hover:text-blue-400"
    //             aria-label="Learn Page"
    //         />
    //     ),
    // },
];
