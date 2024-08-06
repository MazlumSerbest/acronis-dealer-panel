import { useTranslations } from "next-intl";

export default function TenantsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col">{children}</div>;
}
