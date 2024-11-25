import { useEffect } from "react";
import { useRouter, usePathname, redirect } from "next/navigation";
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

import { useLocale, useTranslations } from "next-intl";
import { LuLogOut } from "react-icons/lu";
import useUserStore from "@/store/user";
import useAcronisStore from "@/store/acronis";
import { getFullNameInitials } from "@/lib/utils";

export default function UserCard() {
    const t = useTranslations("General");
    const locale = useLocale();
    const router = useRouter();
    const pathName = usePathname();
    const session = useSession();
    const { user, updateUser } = useUserStore();
    const { updateMainTenant } = useAcronisStore();

    useEffect(() => {
        if (!session) return redirect("/api/auth/signin");
        const sessionUser = session?.data?.user;

        if (sessionUser) {
            fetch(`/api/admin/user/${sessionUser.email ?? ""}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.role === "admin")
                        updateUser({
                            id: data?.id,
                            active: data?.active,
                            licensed: data?.partner?.licensed,
                            role: data?.role,
                            name: data?.name,
                            email: data?.email,
                            acronisTenantId: data?.acronisTenantId,
                            createdAt: data?.createdAt,
                            createdBy: data?.createdBy,
                            partner: data?.partner,
                        });
                    else
                        updateUser({
                            id: data?.id,
                            partnerAcronisId: data?.partnerAcronisId,
                            active: data?.active,
                            licensed: data?.partner?.licensed,
                            role: data?.role,
                            name: data?.name,
                            email: data?.email,
                            acronisTenantId: data?.partnerAcronisId,
                            createdAt: data?.createdAt,
                            createdBy: data?.createdBy,
                            partner: data?.partner,
                        });
                });

            if (sessionUser.role === "admin")
                fetch(
                    `/api/acronis/tenants/15229d4a-ff0f-498b-849d-a4f71bdc81a4`,
                )
                    .then((res) => res.json())
                    .then((data) => updateMainTenant(data?.tenant));
            else if (user?.partnerAcronisId)
                fetch(`/api/acronis/tenants/${user?.partnerAcronisId}`)
                    .then((res) => res.json())
                    .then((data) => updateMainTenant(data?.tenant));
        }
    }, [session, updateMainTenant, updateUser, user?.partnerAcronisId]);

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
            <Sheet>
                <SheetTrigger asChild>
                    <div className="group truncate flex gap-2">
                        <Avatar>
                            <AvatarImage />
                            <AvatarFallback className="bg-blue-100 text-blue-400">
                                {getFullNameInitials(user?.name || "")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-blue-400 group-hover:underline group-hover:cursor-pointer">
                                {user?.name}
                            </p>
                            <p className="truncate text-xs text-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-blue-400">
                            {t("editProfile")}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 my-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t("name")}</Label>
                            <Input
                                readOnly
                                id="name"
                                value={user.name}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="">
                                {t("email")}
                            </Label>
                            <Input
                                readOnly
                                id="username"
                                value={user.email}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <SheetHeader>
                        <SheetTitle className="text-blue-400">
                            {t("otherSettings")}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col mt-4">
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label>{t("language")}</Label>
                            <Select
                                defaultValue={locale}
                                onValueChange={(v) => {
                                    const newPath = pathName.replace(
                                        `/${locale}/`,
                                        `/${v}/`,
                                    );
                                    router.replace(newPath);
                                    router.refresh();
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        className="col-span-1"
                                        placeholder="Language"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tr">Türkçe</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <LuLogOut className="size-6 text-foreground" />
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
                        <AlertDialogCancel>{t("close")}</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                variant="destructive"
                                className="bg-destructive hover:bg-destructive/90"
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
