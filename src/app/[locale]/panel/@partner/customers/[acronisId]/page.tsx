"use client";
import React, { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import useAcronisStore from "@/store/acronis";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import Loader from "@/components/loaders/Loader";
import CustomersTab from "./(tabs)/Customers";
import GeneralTab from "./(tabs)/General";
import LicensesTab from "./(tabs)/Licenses";

export default function CustomerDetail({
    params,
}: {
    params: { acronisId: string };
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "general";
    const pathname = usePathname();
    const t = useTranslations("General");

    const { currentTenant, updateCurrentTenant } = useAcronisStore();
    const [children, setChildren] = useState(undefined);

    //#region Fetch Data
    const { data, error } = useSWR(
        `/api/acronis/tenants/${params.acronisId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                updateCurrentTenant(data.tenant);
                if (data.tenant.kind === "partner") trigger();
            },
        },
    );

    const { trigger, isMutating } = useSWRMutation(
        `/api/acronis/tenants/children/${params.acronisId}`,
        async (url) => {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error("Failed to fetch tenant children");
            return response.json();
        },
        {
            onSuccess: async (data) => {
                if (!data) return;

                try {
                    const [customersResponse, partnersResponse] =
                        await Promise.all([
                            fetch(
                                `/api/customer?partnerAcronisId=${params?.acronisId}`,
                            ),
                            fetch(
                                `/api/partner?parentAcronisId=${params?.acronisId}`,
                            ),
                        ]);

                    const [customers, partners] = await Promise.all([
                        customersResponse.json(),
                        partnersResponse.json(),
                    ]);

                    const newData = data.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        kind: item.kind,
                        enabled: item.enabled,
                        mfa_status: item.mfa_status,
                        billingDate:
                            item.kind === "customer"
                                ? customers.find(
                                      (c: Customer) => c.acronisId === item.id,
                                  )?.billingDate
                                : partners.find(
                                      (p: Partner) => p.acronisId === item.id,
                                  )?.billingDate,
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

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (!data)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <div className="flex flex-col gap-2">
            <div className="container relative flex w-full items-center gap-2">
                <h1 className="flex-1 font-semibold text-2xl text-blue-400 text-center mt-4 md:mt-2 truncate">
                    {currentTenant?.name || ""}
                </h1>
                <div className="hidden sm:flex sm:absolute right-0 gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <LuChevronLeft className="size-6 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            router.forward();
                        }}
                    >
                        <LuChevronRight className="size-6 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <div className="w-full">
                <Tabs
                    defaultValue="general"
                    value={tab}
                    onValueChange={(value) =>
                        router.push(`${pathname}?tab=${value}`)
                    }
                    className="flex flex-col w-full"
                >
                    <TabsList className="mx-auto  *:md:w-[200px] *:w-full mb-2">
                        <TabsTrigger value="general">
                            {t("general")}
                        </TabsTrigger>
                        {currentTenant?.kind == "partner" && (
                            <TabsTrigger value="customers">
                                {t("customers")}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="licenses">
                            {t("licenses")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <GeneralTab t={t} tenant={data?.tenant} />
                    </TabsContent>
                    <TabsContent value="customers">
                        {!isMutating && children ? (
                            <CustomersTab t={t} customers={children} />
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
            </div>
        </div>
    );
}
