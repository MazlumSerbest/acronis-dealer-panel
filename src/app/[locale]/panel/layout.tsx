import NavLayout from "@/components/layout/NavLayout";

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex min-h-screen">
            <NavLayout />
            <main className="flex-1 flex flex-col min-w-0 h-screen gap-2 overflow-auto p-2 pb-4 pt-14 md:p-4 md:pt-6 ">
                {children}
            </main>
        </main>
    );
}
