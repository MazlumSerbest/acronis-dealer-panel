import {
    LuLayoutDashboard,
    LuUnplug,
    LuSettings,
    LuUserRound,
    LuBriefcase,
    LuPackage,
    LuGraduationCap,
    LuHistory,
    LuNewspaper,
    LuFileText,
    LuReceiptText,
    LuHandshake,
    LuShield,
    LuBinoculars,
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
            <LuHandshake
                className="size-6 group-hover:text-blue-400"
                aria-label="Tenants Page"
            />
        ),
    },
    {
        path: "/panel/licenses",
        key: "licenses",
        icon: (
            <LuShield
                className="size-6 group-hover:text-blue-400"
                aria-label="Licenses Page"
            />
        ),
    },
    {
        path: "/panel/licenseHistory",
        key: "licenseHistory",
        icon: (
            <LuHistory
                className="size-6 group-hover:text-blue-400"
                aria-label="License History Page"
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
        path: "/panel/invoices",
        key: "invoices",
        icon: (
            <LuReceiptText
                className="size-6 group-hover:text-blue-400"
                aria-label="Invoices Page"
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
        path: "/panel/customers",
        key: "customers",
        icon: (
            <LuHandshake
                className="size-6 group-hover:text-blue-400"
                aria-label="Customers Page"
            />
        ),
    },
    {
        path: "/panel/users",
        key: "users",
        icon: (
            <LuUserRound
                className="size-6 group-hover:text-blue-400"
                aria-label="Users Page"
            />
        ),
    },
    {
        path: "/panel/news",
        key: "news",
        icon: (
            <LuNewspaper
                className="size-6 group-hover:text-blue-400"
                aria-label="News Page"
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
    {
        path: "/panel/potentialPartners",
        key: "potentialPartners",
        icon: (
            <LuBinoculars
                className="size-6 group-hover:text-blue-400"
                aria-label="Potential Partners Page"
            />
        ),
    },
    // {
    //     path: "/panel/applications",
    //     key: "applications",
    //     icon: (
    //         <LuArchiveRestore
    //             className="size-6 group-hover:text-blue-400"
    //             aria-label="Applications Page"
    //         />
    //     ),
    // },
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
            <LuHandshake
                className="size-6 group-hover:text-blue-400"
                aria-label="Customers Page"
            />
        ),
    },
    {
        path: "/panel/licenses",
        key: "licenses",
        icon: (
            <LuShield
                className="size-6 group-hover:text-blue-400"
                aria-label="Licenses Page"
            />
        ),
    },
    {
        path: "/panel/licenseHistory",
        key: "licenseHistory",
        icon: (
            <LuHistory
                className="size-6 group-hover:text-blue-400"
                aria-label="License History Page"
            />
        ),
    },
    // {
    //     path: "/panel/alerts",
    //     key: "alerts",
    //     icon: (
    //         <LuTriangleAlert
    //             className="size-6 group-hover:text-blue-400"
    //             aria-label="Alerts Page"
    //         />
    //     ),
    // },
    {
        path: "/panel/users",
        key: "users",
        icon: (
            <LuUserRound
                className="size-6 group-hover:text-blue-400"
                aria-label="Users Page"
            />
        ),
    },
    {
        path: "/panel/invoices",
        key: "invoices",
        icon: (
            <LuFileText
                className="size-6 group-hover:text-blue-400"
                aria-label="Invoices Page"
            />
        ),
    },
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
        path: "/panel/learn",
        key: "learn",
        icon: (
            <LuGraduationCap
                className="size-6 group-hover:text-blue-400"
                aria-label="Learn Page"
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
];
