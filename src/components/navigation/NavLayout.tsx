"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useOnClickOutside } from "usehooks-ts";

import UserCard from "./UserCard";
import Logo from "./Logo";
import { adminPaths, partnerPaths } from "@/lib/paths";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import { LuArrowUpRight, LuMenu } from "react-icons/lu";
import useAcronisStore from "@/store/acronis";
import useUserStore from "@/store/user";

export default function NavLayout() {
    const t = useTranslations("General");
    const [showSidebar, setShowSidebar] = useState(false);
    const { user: currentUser } = useUserStore();
    const { userTenant } = useAcronisStore();

    const pathName = usePathname();

    const ref = useRef(null);
    useOnClickOutside(ref, (_) => {
        setShowSidebar(false);
    });

    useEffect(() => {}, [userTenant]);

    return (
        <>
            {/* Navbar */}
            <nav className="flex lg:hidden bg-white shadow z-[47] items-center fixed top-0 w-screen h-min py-2 px-4 gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(true)}
                    onTouchEnd={() => setShowSidebar(true)}
                >
                    <LuMenu className="size-7 text-zinc-600" />
                </Button>
                {userTenant ? (
                    <div className="flex flex-1 w-1/2 items-center justify-center">
                        <h1 className="font-semibold text-blue-400 truncate">
                            {userTenant.name}
                        </h1>
                    </div>
                ) : (
                    <span className="flex-1" />
                )}
                <Logo width={32} height={36} />
            </nav>
            {/* Sidebar */}
            <div
                ref={ref}
                className={
                    "fixed lg:sticky flex flex-col z-[48] shrink-0 bg-white shadow-lg lg:w-64 h-screen t-0 p-3 py-5 gap-3 border-r border-slate-200 transition-transform .3s ease-in-out lg:translate-x-0" +
                    (!showSidebar ? " -translate-x-full" : "")
                }
            >
                <Logo width={46} height={64} />

                <Separator />

                {userTenant ? (
                    <div className="flex flex-col w-52 gap-1">
                        <h1 className="text-lg font-semibold text-blue-400">
                            {currentUser?.role == "admin"
                                ? "Admin Panel"
                                : "Partner Panel"}
                        </h1>
                        <h2 className="text-sm font-semibold text-zinc-600">
                            {currentUser?.role == "partner" && userTenant.name}
                        </h2>
                    </div>
                ) : (
                    <div className="animate-pulse flex items-center">
                        <div className="w-full h-6 bg-slate-200 rounded"></div>
                    </div>
                )}
                <div className="flex flex-col flex-grow overflow-x-hidden overflow-y-auto min-h-0 gap-1">
                    {currentUser?.role == "admin" ? (
                        <>
                            {adminPaths.map((p, index) => {
                                let withoutLocale = pathName.substring(
                                    pathName.indexOf("/panel"),
                                );
                                return (
                                    <Button
                                        variant={
                                            withoutLocale.includes(p.path) &&
                                            p.path != "/panel"
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        key={p.key}
                                        asChild
                                    >
                                        <Link
                                            href={p.path}
                                            onClick={() =>
                                                setShowSidebar(false)
                                            }
                                            onTouchEnd={() =>
                                                setShowSidebar(false)
                                            }
                                            className={
                                                "group flex flex-row w-full justify-items-start gap-2 " +
                                                (withoutLocale.includes(
                                                    p.path,
                                                ) && p.path != "/panel"
                                                    ? "*:text-blue-400"
                                                    : "*:text-zinc-600")
                                            }
                                        >
                                            {p.icon}
                                            <span className="w-full group-hover:text-blue-400">
                                                {t("Pages." + p.key)}
                                            </span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </>
                    ) : (
                        partnerPaths.map((p, index) => {
                            let withoutLocale = pathName.substring(
                                pathName.indexOf("/panel"),
                            );
                            return (
                                <Button
                                    variant={
                                        withoutLocale.includes(p.path) &&
                                        p.path != "/panel"
                                            ? "secondary"
                                            : "ghost"
                                    }
                                    key={p.key}
                                    asChild
                                >
                                    <Link
                                        href={p.path}
                                        onClick={() => setShowSidebar(false)}
                                        onTouchEnd={() => setShowSidebar(false)}
                                        className={
                                            "group flex flex-row w-full justify-items-start gap-2 " +
                                            (withoutLocale.includes(p.path) &&
                                            p.path != "/panel"
                                                ? "*:text-blue-400"
                                                : "*:text-zinc-600")
                                        }
                                    >
                                        {p.icon}
                                        <span className="w-full group-hover:text-blue-400">
                                            {t("Pages." + p.key)}
                                        </span>
                                    </Link>
                                </Button>
                            );
                        })
                    )}
                </div>

                <div className="flex">
                    <Button
                        size="sm"
                        variant="link"
                        className="p-0 m-auto text-muted-foreground underline-muted-foreground"
                        asChild
                    >
                        <Link
                            target="_blank"
                            href={`https://tr01-cloud.acronis.com/mc/app;group_id=${userTenant?.id}`}
                        >
                            Acronis Cyber Protect Cloud
                            <LuArrowUpRight className="ml-2 size-3" />
                        </Link>
                    </Button>
                </div>

                <Separator />

                <UserCard />
            </div>
        </>
    );
}
