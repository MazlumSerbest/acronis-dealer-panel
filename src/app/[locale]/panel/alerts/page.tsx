"use client";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Loader from "@/components/loaders/Loader";
import useUserStore from "@/store/user";

export default function AlertsPage() {
    const t = useTranslations("Alerts");
    const { user: currentUser } = useUserStore();

    const { data, error } = useSWR(
        `/api/acronis/alert/${currentUser?.acronisUUID}`,
    );

    if (error) return <div>failed to load</div>;
    if (!data) return <Loader />;
    return (
        <>
            <p>{data.alert?.type}</p>
        </>
    );
}
