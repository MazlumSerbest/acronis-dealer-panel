"use client";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import LoaderSpinner from "@/components/loader/LoaderSpinner";

export default function AlertsPage() {
    const t = useTranslations("Alerts");

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(
        "/api/acronis/alert/7def9e05-435b-4fb5-ae57-2a77bfd3de4a",
        fetcher,
    );

    if (error) return <div>failed to load</div>;
    if (!data) return <LoaderSpinner />;

    return(
        <>
            <p>{data.alert?.type}</p>
        </>
    )
}