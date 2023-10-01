import { useTranslations } from "next-intl";
import PageHeader from "@/components/PageHeader";

export default function ClientsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("General.Pages");
    return (
        <div className="flex flex-col h-full">
            <PageHeader title={t("clients")} />
            {children}
        </div>
    );
}