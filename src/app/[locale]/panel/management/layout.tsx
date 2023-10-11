import { useTranslations } from "next-intl";
import PageHeader from "@/components/PageHeader";

export default function ManagementLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("General.Pages");
    return (
        <div className="flex flex-col">
            <PageHeader title={t("management")} />
            {children}
        </div>
    );
}