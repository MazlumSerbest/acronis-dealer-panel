"use client";
import { useState, useRef } from "react";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { useOnClickOutside } from "usehooks-ts";

import UserCard from "./UserCard";
import Logo from "./Logo";
import { paths } from "@/lib/paths";

import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Listbox, ListboxItem } from "@nextui-org/listbox";

import { BiMenu } from "react-icons/bi";

export default function NavLayout() {
    const [showSidebar, setShowSidebar] = useState(false);

    const t = useTranslations("General.Pages");

    const sidebarPaths = paths;
    const pathName = usePathname();

    const ref = useRef(null);
    useOnClickOutside(ref, (_) => {
        setShowSidebar(false);
    });

    return (
        <>
            {/* Navbar */}
            <nav className="flex md:hidden bg-white shadow z-[47] items-center fixed top-0 w-screen h-min py-2 px-4 gap-2">
                <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setShowSidebar(true)}
                    onTouchEnd={() => setShowSidebar(true)}
                >
                    <BiMenu className="text-2xl text-zinc-500" />
                </Button>
                <span className="flex-1" />
                <Logo width={32} height={36} />
            </nav>
            {/* Sidebar */}
            <div
                ref={ref}
                className={
                    "fixed md:sticky flex flex-col z-[48] shrink-0 bg-white shadow-lg md:w-50 lg:w-64 h-screen t-0 p-3 py-5 gap-3 border-r border-slate-200 transition-transform .3s ease-in-out md:translate-x-0" +
                    (!showSidebar ? " -translate-x-full" : "")
                }
            >
                <Logo width={46} height={64} />
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
                                        onClick={() => setShowSidebar(false)}
                                        onTouchEnd={() => setShowSidebar(false)}
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
        </>
    );
}
