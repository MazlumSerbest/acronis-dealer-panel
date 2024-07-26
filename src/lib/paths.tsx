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
} from "react-icons/lu";

export const paths: Path[] = [
    {
        path: "/panel",
        key: "panel",
        roles: ["admin", "partner"],
        icon: (
            <LuLayoutDashboard
                className="size-6 group-hover:text-blue-400"
                aria-label="Dashboard"
            />
        ),
    },
    {
        path: "/panel/clients",
        key: "clients",
        roles: ["admin", "partner"],
        icon: (
            <LuHeartHandshake
                className="size-6 group-hover:text-blue-400"
                aria-label="Clients Page"
            />
        ),
    },
    {
        path: "/panel/licenses",
        key: "licenses",
        roles: ["admin", "partner"],
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
        roles: ["admin", "partner"],
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
        roles: ["admin", "partner"],
        icon: (
            <LuSettings
                className="size-6 group-hover:text-blue-400"
                aria-label="Settings Page"
            />
        ),
    },
    {
        path: "/panel/applications",
        key: "applications",
        roles: ["admin"],
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
        roles: ["admin"],
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
];
