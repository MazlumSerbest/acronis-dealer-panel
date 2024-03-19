import { useState, useEffect } from "react";
import useSWR from "swr";
// import { useSession, signOut } from "next-auth/react";

import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";

import { useTranslations } from "next-intl";
import { BiLogOut } from "react-icons/bi";
import useUserStore from "@/store/user";
import useAcronisStore from "@/store/acronis";

export default function UserCard() {
    const t = useTranslations("General");
    const { user, updateUser } = useUserStore();
    const { updateMainTenant } = useAcronisStore();
    // const { data: session } = useSession();

    // const { data, error, mutate } = useSWR(
    //     `/api/acronis/tenant/${user?.acronisTenantUUID}`,
    // );

    const session = {
        user: {
            name: "Administrator",
            email: "test@gmail.com",
        },
    };
    
    useEffect(() => {
        async function getTenant() {
            await updateUser({
                id: 1,
                active: true,
                username: "admin",
                name: "Güngör Yılmaz",
                email: "gungor.yilmaz@d3bilisim.com.tr",
                acronisTenantUUID: "9894ccb9-8db6-40dd-b83d-bbf358464783",
                createdAt: new Date().toISOString(),
                createdBy: "admin",
            });

            await fetch(`/api/acronis/tenant/${user?.acronisTenantUUID}`)
                .then((res) => res.json())
                .then((data) => {
                    updateMainTenant(data.tenant);
                });
        }

        getTenant();
    }, [updateMainTenant, updateUser, user?.acronisTenantUUID]);

    // if (error) return <div>failed to load</div>;
    if (!user)
        return (
            <div className="animate-pulse flex gap-2 items-center">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 flex flex-col min-w-0 gap-1">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                </div>
                <div className="rounded bg-slate-200 h-8 w-8"></div>
            </div>
        );
    return (
        <div className="flex gap-2 items-center">
            <Avatar>
                <AvatarImage />
                <AvatarFallback className="bg-blue-100 text-blue-400">
                    {(user?.name?.split(" ")?.at(0)?.charAt(0)?.toUpperCase() ||
                        "?") +
                        (user?.name
                            ?.split(" ")
                            ?.at(-1)
                            ?.charAt(0)
                            ?.toUpperCase() || "")}
                </AvatarFallback>
            </Avatar>
            {/* <Avatar
                        icon={<AvatarIcon />}
                        classNames={{
                            base: "bg-blue-200",,,0,
                            icon: "text-blue-400",
                        }}
                    /> */}
            <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-blue-400">
                    {user?.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <BiLogOut className="size-6 text-zinc-500" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("logout")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("logoutMessage")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="secondary">{t("cancel")}</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-600/80"
                                // onClick={() => signOut()}
                            >
                                {t("logout")}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
