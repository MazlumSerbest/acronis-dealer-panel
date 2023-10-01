import { useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { useOnClickOutside } from "usehooks-ts";

import UserCard from "./UserCard";
import { Divider } from "@nextui-org/divider";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { paths } from "@/lib/paths";

export default async function Sidebar(props: {
    open: boolean;
    setOpen(open: boolean): void;
}) {
    const t = useTranslations("General.Pages");
    const sidebarPaths = paths;
    const pathName = usePathname();
    const ref = useRef(null);
    useOnClickOutside(ref, (_) => {
        props.setOpen(false);
    });
    return (
        <div
            ref={ref}
            className={
                "fixed md:sticky flex flex-col z-[48] shrink-0 bg-white shadow-lg md:w-50 lg:w-64 h-screen t-0 p-3 py-5 gap-3 border-r border-slate-200 transition-transform .3s ease-in-out md:translate-x-0" +
                (!props.open ? " -translate-x-full" : "")
            }
        >
            <div className="flex justify-center">
                <Image
                    src="/images/dcube.png"
                    width={46}
                    height={64}
                    alt="StepEng"
                    className=""
                />
            </div>
            <Divider />
            <div className="flex flex-col flex-grow overflow-x-hidden overflow-y-auto min-h-0">
                <Listbox
                    variant="bordered"
                    // color="primary"
                    className="gap-1 text-md text-zinc-600"
                    aria-label="Menu listbox"
                >
                    {sidebarPaths.map((p, index) => {
                        let withoutLocale = pathName.substring(
                            pathName.indexOf("/panel"),
                        );
                        return (
                            <ListboxItem
                                key={p.key}
                                startContent={p.icon}
                                className={
                                    "font-semibold" +
                                    (withoutLocale == p.path
                                        ? " bg-blue-100"
                                        : "")
                                }
                            >
                                <NextLink
                                    className="absolute inset-0 outline-none"
                                    href={p.path}
                                />
                                {t(p.key)}
                            </ListboxItem>
                        );
                    })}
                </Listbox>
            </div>
            <Divider />
            <UserCard />
        </div>
    );
}
