import { useTranslations } from "next-intl";

export default function ClientsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col">{children}</div>;
}
