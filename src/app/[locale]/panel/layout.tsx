import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import NavLayout from "@/components/navigation/NavLayout";

export default async function PanelLayout({
    admin,
    partner,
}: {
    admin: React.ReactNode;
    partner: React.ReactNode;
}) {
    const session = await auth();

    if (!session) return redirect("/api/auth/signin");
    return (
        <SessionProvider refetchOnWindowFocus>
            <main className="flex">
                <NavLayout />
                <div className="relative flex-1 flex flex-col gap-2 h-dvh overflow-auto p-2 pb-4 pt-16 lg:p-4 lg:pt-4">
                    {session.user?.role == "admin" ? admin : partner}
                </div>
            </main>
        </SessionProvider>
    );
}
