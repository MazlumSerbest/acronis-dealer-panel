"use client";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Loader from "@/components/loader/LoaderSpinner";

export default function ClientsPage() {
    const t = useTranslations("Clients");

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(
        "/api/acronis/tenant/children/28a5db46-58eb-4a61-b064-122f07ddac6a",
        fetcher,
    );

    if (error) return <div>failed to load</div>;
    if (!data) return <Loader />;

    return (
        <div>
            {data.children?.items.map((t: Tenant) => {
                return (<p className="text-zinc-900 truncate" key={t.id}>{t.name}</p>)
            })}
        </div>
    );
}
