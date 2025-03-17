import { LuLoaderCircle } from "react-icons/lu";
import Logo from "../navigation/Logo";

export default function Loader() {
    return (
        <div className="flex w-full h-full items-center justify-center">
            <LuLoaderCircle className="animate-spin text-5xl text-blue-400" />
        </div>
    );
}

export function MainLoader() {
    return (
        <div className="flex animate-pulse w-screen h-dvh items-center justify-center">
            <Logo
                width={120}
                height={50}
            />
        </div>
    );
}
