"use client";
import useSWR from "swr";
import Loader from "@/components/loader/Loader";

export default function SettingsPage() {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/acronis/authorization", fetcher);

    if (error) return <div>failed to load</div>;
    if (!data) return <Loader />;
    
    return (
        <div>
            <p className="text-zinc-900">Token: {data.auth.access_token}</p>
        </div>
    );
}