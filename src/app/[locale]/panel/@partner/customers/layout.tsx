import { useTranslations } from "next-intl";

export default function CustomersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col">{children}</div>;
}
