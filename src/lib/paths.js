import { BiCollection, BiBuildingHouse, BiSlider, BiCog } from "react-icons/bi";

export const paths = [
    {
        path: "/panel",
        key: "dashboard",
        icon: <BiCollection className="text-2xl text-zinc-500" aria-label="Dashboard"/>,
    },
    {
        path: "/panel/clients",
        key: "clients",
        icon: <BiBuildingHouse className="text-2xl text-zinc-500" aria-label="Clients Page"/>,
    },
    {
        path: "/panel/management",
        key: "management",
        icon: <BiSlider className="text-2xl text-zinc-500"  aria-label="Management Page"/>,
    },
    {
        path: "/panel/settings",
        key: "settings",
        icon: <BiCog className="text-2xl text-zinc-500"  aria-label="Settings Page"/>,
    },
]