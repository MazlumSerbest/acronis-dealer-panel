import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

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
import { LuLogOut } from "react-icons/lu";
import useUserStore from "@/store/user";
import useAcronisStore from "@/store/acronis";
import { getFullNameInitials } from "@/lib/utils";

export default function UserCard() {
    const t = useTranslations("General");
    const session = useSession();
    const { user, updateUser } = useUserStore();
    const { updateMainTenant } = useAcronisStore();

    useEffect(() => {
        if (session?.data?.user) {
            fetch(`/api/user/${session?.data?.user?.email ?? ""}`)
                .then((res) => res.json())
                .then((data) => {
                    updateUser({
                        id: data?.id,
                        active: data?.active,
                        role: data?.role,
                        name: data?.name,
                        email: data?.email,
                        acronisId: data?.acronisId,
                        createdAt: data?.createdAt,
                        createdBy: "admin",
                    });
                });
        }

        if (user?.acronisId)
            fetch(`/api/acronis/tenant/${user?.acronisId}`)
                .then((res) => res.json())
                .then((data) => updateMainTenant(data?.tenant));
    }, [
        session?.data?.user,
        updateMainTenant,
        updateUser,
        user?.acronisId,
    ]);

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
                    {getFullNameInitials(user?.name || "")}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-blue-400">
                    {user?.name}
                </p>
                <p className="truncate text-xs text-zinc-600">{user?.email}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <LuLogOut className="size-6 text-zinc-600" />
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
                                onClick={() => signOut()}
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
