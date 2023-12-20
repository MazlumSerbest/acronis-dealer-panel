"use client";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useAcronisStore from "@/app/store/acronis";
import { Tab, Tabs } from "@nextui-org/tabs";
import { Tooltip } from "@nextui-org/tooltip";
import { Input } from "@nextui-org/input";
import { BiX, BiLinkExternal } from "react-icons/bi";
import Skeleton, {
    DefaultSkeleton,
    TableSkeleton,
} from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import ClientsTab from "./_tabs/Clients";
import GeneralTab from "./_tabs/General";
import LicensesTab from "./_tabs/Licenses";
import toast from "react-hot-toast";
import { useEffectOnce } from "usehooks-ts";

export default function ClientDetail({ params }: { params: { id: string } }) {
    const t = useTranslations("General");
    const { currentTenant, updateCurrentTenant } = useAcronisStore();
    const router = useRouter();
    const [children, setChildren] = useState(undefined);

    const renderCell = React.useCallback(
        (client: Tenant, columnKey: React.Key) => {
            const cellValue: any = client[columnKey as keyof typeof client];

            switch (columnKey) {
                case "kind":
                    return (
                        <h6>
                            {cellValue
                                ? cellValue == "partner"
                                    ? t("partner")
                                    : t("customer")
                                : "-"}
                        </h6>
                    );
                case "mfa_status":
                    return <BoolChip value={cellValue == "enabled"} />;
                case "enabled":
                    return <BoolChip value={cellValue} />;
                case "actions":
                    return (
                        <div className="relative flex justify-start items-center">
                            <Tooltip key={client.id} content={t("openDetail")}>
                                <span className="text-xl text-blue-400 active:opacity-50">
                                    <BiLinkExternal
                                        onClick={() =>
                                            router.push("clients/" + client.id)
                                        }
                                    />
                                </span>
                            </Tooltip>
                        </div>
                    );
                default:
                    return cellValue;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    //#region Fetch Data
    const { data, error } = useSWR(`/api/acronis/tenant/${params.id}`, null, {
        onSuccess: (data) => {
            updateCurrentTenant(data.tenant);
            trigger();
        },
    });

    const { trigger, isMutating } = useSWRMutation(
        () => `/api/acronis/tenant/children/${params.id}`,
        (url: string) => fetch(url).then((res) => res.json()),
        {
            onSuccess: (data) => {
                setChildren(data?.children?.items ?? []);
            },
        },
    );

    if (error) return <div>{error}</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );

    let clientTableLoading = (
        <Skeleton>
            <TableSkeleton />
        </Skeleton>
    );

    //#endregion

    return (
        <div className="flex flex-col gap-2">
            <div className="flex w-full items-end">
                <h1 className="flex-1 font-semibold text-xl text-blue-400 mt-4 md:mt-2">
                    {currentTenant?.name || ""}
                </h1>
                <BiX
                    className="text-3xl text-zinc-500 cursor-pointer"
                    onClick={() => {
                        router.back();
                    }}
                />
            </div>
            <div className="flex w-full flex-col">
                <Tabs
                    aria-label="Tenant Tab"
                    variant="underlined"
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
                    <Tab key="general" title={t("general")}>
                        {GeneralTab(t, data?.tenant)}
                    </Tab>
                    <Tab key="clients" title={t("clients")}>
                        {!isMutating && children
                            ? ClientsTab(t, renderCell, children)
                            : clientTableLoading}
                    </Tab>
                    <Tab key="licenses" title={t("licenses")}>
                        {LicensesTab(t, data?.tenant)}
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}
