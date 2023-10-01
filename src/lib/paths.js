import { BiPulse, BiBuildingHouse, BiSlider, BiCog } from "react-icons/bi";

export const paths = [
    {
        path: "/panel/clients",
        key: "clients",
        icon: <BiBuildingHouse className="text-2xl text-zinc-500" />,
    },
    {
        path: "/panel/monitoring",
        key: "monitoring",
        icon: <BiPulse className="text-2xl text-zinc-500" aria-label="Monitoring"/>,
    },
    {
        path: "/panel/management",
        key: "management",
        icon: <BiSlider className="text-2xl text-zinc-500" />,
    },
    {
        path: "/panel/settings",
        key: "settings",
        icon: <BiCog className="text-2xl text-zinc-500" />,
    },
]