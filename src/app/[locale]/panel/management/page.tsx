"use client";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Loader from "@/components/loader/LoaderSpinner";

export default function ManagementPage() {
        const t = useTranslations("Management");

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(
        "/api/acronis/tenant/users/28a5db46-58eb-4a61-b064-122f07ddac6a",
        fetcher,
    );

    if (error) return <div>failed to load</div>;
    if (!data) return <Loader />;

    return (
        <div>
            {data.users?.items.map((t: TenantUser) => {
                return (<p className="text-zinc-900 truncate" key={t.id}>{t.login}</p>)
            })}
        </div>
    );
}