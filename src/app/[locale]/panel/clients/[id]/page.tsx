"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useAcronisStore from "@/store/acronis";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { LuX } from "react-icons/lu";
import Skeleton, {
    DefaultSkeleton,
    TableSkeleton,
} from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import ClientsTab from "./(tabs)/Clients";
import GeneralTab from "./(tabs)/General";
import LicensesTab from "./(tabs)/Licenses";

export default function ClientDetail({ params }: { params: { id: string } }) {
    const t = useTranslations("General");
    const { currentTenant, updateCurrentTenant } = useAcronisStore();
    const router = useRouter();
    const [children, setChildren] = useState(undefined);

    //#region Fetch Data
    const { data, error } = useSWR(`/api/acronis/tenants/${params.id}`, null, {
        onSuccess: (data) => {
            updateCurrentTenant(data.tenant);
            trigger();
        },
    });

    const { trigger, isMutating } = useSWRMutation(
        () => `/api/acronis/tenants/children/${params.id}`,
        (url: string) => fetch(url).then((res) => res.json()),
        {
            onSuccess: (data) => {
                setChildren(data?.children?.items ?? []);
            },
        },
    );
    //#endregion

    if (error) return <div>{error}</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-2">
            <div className="flex w-full items-end">
                <h1 className="flex-1 font-semibold text-xl text-blue-400 mt-4 md:mt-2 truncate">
                    {currentTenant?.name || ""}
                </h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        router.back();
                    }}
                >
                    <LuX className="text-3xl text-zinc-500" />
                </Button>
            </div>
            <div className="w-full">
                <Tabs defaultValue="general" className="flex flex-col w-full">
                    <TabsList className="mx-auto  *:md:w-[200px] mb-2">
                        <TabsTrigger value="general" className="">
                            {t("general")}
                        </TabsTrigger>
                        {currentTenant?.kind == "partner" && (
                            <TabsTrigger value="clients" className="w-full">
                                {t("clients")}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="licenses" className="w-full">
                            {t("licenses")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <Suspense
                            fallback={
                                <Skeleton>
                                    <DefaultSkeleton />
                                </Skeleton>
                            }
                        >
                            <GeneralTab t={t} tenant={data?.tenant} />
                        </Suspense>
                    </TabsContent>
                    <TabsContent value="clients">
                        {!isMutating && children ? (
                            <ClientsTab t={t} clients={children} />
                        ) : (
                            <Skeleton>
                                <TableSkeleton />
                            </Skeleton>
                        )}
                    </TabsContent>
                    <TabsContent value="licenses">
                        <Suspense
                            fallback={
                                <Skeleton>
                                    <DefaultSkeleton />
                                </Skeleton>
                            }
                        >
                            <LicensesTab t={t} tenant={data?.tenant} />
                        </Suspense>
                    </TabsContent>
                </Tabs>
                {/* <Tabs
                    aria-label="Tenant Tab"
                    color="primary"
                    size="lg"
                    classNames={{
                        tabList:
                            "gap-4 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-blue-400",
                        tab: "max-w-fit",
                        tabContent: "group-data-[selected=true]:text-blue-400",
                    }}
                >
                    
                </Tabs> */}
            </div>
        </div>
    );
}
