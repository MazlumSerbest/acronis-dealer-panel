import { useTranslations } from "next-intl";

export default function ClientsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("General.Pages");

    return (
        <div className="flex flex-col">
            {children}
        </div>
    );
}
