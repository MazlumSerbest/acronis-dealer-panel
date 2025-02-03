import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import NavLayout from "@/components/navigation/NavLayout";

export default async function PanelLayout({
    admin,
    partner,
}: {
    admin: React.ReactNode;
    partner: React.ReactNode;
}) {
    const session = await auth();
    const locale = await getLocale();

    if (!session) return redirect(`/${locale}/signin`);
    return (
        <main className="flex">
            <NavLayout />
            <div className="relative flex-1 flex flex-col gap-2 h-dvh overflow-auto p-2 pb-4 pt-16 lg:p-4 lg:pt-4">
                {session.user?.role == "admin" ? admin : partner}
            </div>
        </main>
    );
}
