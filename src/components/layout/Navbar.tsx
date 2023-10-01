import Image from "next/image";
import { Button } from "@nextui-org/button";

import { BiMenu } from "react-icons/bi";

export default function Navbar(props: { onMenuButtonClick(): void }) {
    return (
        <nav className="flex md:hidden bg-white shadow z-[47] items-center fixed top-0 w-screen h-min py-2 px-4 gap-2">
            <Button
                isIconOnly
                variant="light"
                onClick={props.onMenuButtonClick}
            >
                <BiMenu className="text-2xl text-zinc-500" />
            </Button>
            <span className="flex-1" />
            <Image
                src="/images/dcube.png"
                width={32}
                height={36}
                alt="Step Mühendislik"
            />
        </nav>
    );
}
