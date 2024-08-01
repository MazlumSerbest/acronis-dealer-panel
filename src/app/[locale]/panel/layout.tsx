import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import NavLayout from "@/components/navigation/NavLayout";

export default async function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        const url = "/api/auth/signin";
        return redirect(url);
    }

    if (!session) return <></>;
    return (
        <SessionProvider>
            <main className="flex h-screen">
                <NavLayout />
                <main className="flex-1 flex flex-col min-w-0 h-dvh gap-2 overflow-auto p-2 pb-4 pt-16 lg:p-4 lg:pt-4">
                    {children}
                </main>
            </main>
        </SessionProvider>
    );
}
