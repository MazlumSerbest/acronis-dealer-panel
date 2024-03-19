import React from "react";
import {
    LuLayoutDashboard,
    LuHeartHandshake,
    LuKeyRound,
    LuAlertTriangle,
    LuUnplug,
    LuSettings,
} from "react-icons/lu";

export const paths: Path[] = [
    {
        path: "/panel",
        key: "dashboard",
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
];
