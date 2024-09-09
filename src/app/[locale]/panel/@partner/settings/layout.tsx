import { useTranslations } from "next-intl";
import PageHeader from "@/components/PageHeader";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("General.Pages");
    
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("settings")} />
            {children}
        </div>
    );
}