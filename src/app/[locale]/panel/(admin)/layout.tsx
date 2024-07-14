"use client";
import useUserStore from "@/store/user";
import { redirect } from "next/navigation";
import { use, useEffect } from "react";

export default function AdminPagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user: currentUser } = useUserStore();

    useEffect(() => {
        if (currentUser?.role && currentUser?.role != "admin") {
            const url = "/api/auth/signin";
            return redirect(url);
        }
    }, [currentUser?.role]);

    if (currentUser?.role == undefined) return <></>;
    return <>{children}</>;
}
