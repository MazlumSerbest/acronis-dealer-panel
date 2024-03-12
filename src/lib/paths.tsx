import React from "react";
import {
    BiCollection,
    BiBuildingHouse,
    BiShieldQuarter,
    BiError,
    BiSlider,
    BiCog,
} from "react-icons/bi";

export const paths: Path[] = [
    {
        path: "/panel",
        key: "dashboard",
        icon: <BiCollection className="size-6 group-hover:text-blue-400" aria-label="Dashboard" />,
    },
    {
        path: "/panel/clients",
        key: "clients",
        icon: <BiBuildingHouse className="size-6 group-hover:text-blue-400" aria-label="Clients Page" />,
    },
    {
        path: "/panel/licenses",
        key: "licenses",
        icon: <BiShieldQuarter className="size-6 group-hover:text-blue-400" aria-label="Licenses Page" />,
    },
    // {
    //     path: "/panel/alerts",
    //     key: "alerts",
    //     icon: (
    //         <BiError
    //             className="size-6 group-hover:text-blue-400"
    //             aria-label="Alerts Page"
    //         />
    //     ),
    // },
    {
        path: "/panel/management",
        key: "management",
        icon: <BiSlider className="size-6 group-hover:text-blue-400" aria-label="Management Page" />,
    },
    {
        path: "/panel/settings",
        key: "settings",
        icon: <BiCog className="size-6 group-hover:text-blue-400" aria-label="Settings Page" />,
    },
];
