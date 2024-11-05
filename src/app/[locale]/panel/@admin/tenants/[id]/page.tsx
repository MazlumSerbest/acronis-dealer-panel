"use client";
import React, { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useAcronisStore from "@/store/acronis";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { LuX } from "react-icons/lu";
import Skeleton, {
    TableSkeleton,
} from "@/components/loaders/Skeleton";
import Loader from "@/components/loaders/Loader";
import ClientsTab from "./(tabs)/Clients";
import GeneralTab from "./(tabs)/General";
import LicensesTab from "./(tabs)/Licenses";

export default function TenantDetail({ params }: { params: { id: string } }) {
    const t = useTranslations("General");
    const { currentTenant, updateCurrentTenant } = useAcronisStore();
    const router = useRouter();
    const [children, setChildren] = useState(undefined);

    //#region Fetch Data
    const { data, error } = useSWR(`/api/acronis/tenants/${params.id}`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            updateCurrentTenant(data.tenant);
            if (data.tenant.kind === "partner") trigger();
        },
    });

    const { trigger, isMutating } = useSWRMutation(
        `/api/acronis/tenants/children/${params.id}`,
        async (url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch tenant children");
            return response.json();
        },
        {
            onSuccess: async (data) => {
                if (!data) return;

                try {
                    const panelPartnerResponse = await fetch(`/api/partner/${params?.id}`);
                    const panelPartner = await panelPartnerResponse.json();

                    const [customersResponse, partnersResponse] = await Promise.all([
                        fetch(`/api/customer?partnerId=${panelPartner?.id}`),
                        fetch(`/api/partner?parentAcronisId=${params?.id}`)
                    ]);

                    const [customers, partners] = await Promise.all([
                        customersResponse.json(),
                        partnersResponse.json()
                    ]);

                    const newData = data.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        kind: item.kind,
                        enabled: item.enabled,
                        mfa_status: item.mfa_status,
                        billingDate: item.kind === "customer" 
                            ? customers.find((c: Customer) => c.acronisId === item.id)?.billingDate
                            : partners.find((p: Partner) => p.acronisId === item.id)?.billingDate,
                        usages: item.usages,
                    }));

                    setChildren(newData);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            },
        },
    );
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <div className="h-80">
                <Loader />
            </div>
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
                    <TabsList className="mx-auto *:md:w-[200px] mb-2">
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
                        <GeneralTab t={t} tenant={data?.tenant} />
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
                        <LicensesTab t={t} tenant={data?.tenant} />
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
