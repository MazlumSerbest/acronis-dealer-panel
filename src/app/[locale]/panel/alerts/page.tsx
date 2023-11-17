"use client";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Loader from "@/components/loaders/Loader";

export default function AlertsPage() {
    const t = useTranslations("Alerts");

    const { data, error } = useSWR(
        "/api/acronis/alert/7def9e05-435b-4fb5-ae57-2a77bfd3de4a",
    );

    if (error) return <div>failed to load</div>;
    if (!data) return <Loader />;

    return (
        <>
            <p>{data.alert?.type}</p>
        </>
    );
}
