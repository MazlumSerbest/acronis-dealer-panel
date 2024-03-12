"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { SortDescriptor } from "@nextui-org/table";
import { Tooltip } from "@nextui-org/tooltip";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { BiLinkExternal } from "react-icons/bi";
import { DateTimeFormat } from "@/utils/date";
import useUserStore from "@/store/user";

export default function ClientsPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currUser } = useUserStore();

    //#region Table
    const visibleColumns = ["name", "kind", "mfa_status", "enabled", "actions"];

    const sort: SortDescriptor = {
        column: "createdAt",
        direction: "descending",
    };

    const columns: Column[] = [
        {
            key: "id",
            name: t("id"),
            width: 200,
            searchable: true,
            sortable: true,
        },
        {
            key: "name",
            name: t("name"),
            width: 200,
            searchable: true,
            sortable: true,
        },
        {
            key: "kind",
            name: t("kind"),
            width: 200,
        },
        {
            key: "mfa_status",
            name: t("mfaStatus"),
            width: 75,
        },
        {
            key: "enabled",
            name: t("enabled"),
            width: 75,
        },
        {
            key: "created_at",
            name: t("createdAt"),
            width: 150,
            sortable: true,
        },
        {
            key: "updated_at",
            name: t("updatedAt"),
            width: 150,
            sortable: true,
        },
        {
            key: "actions",
            name: t("actions"),
            width: 75,
        },
    ];

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
                case "created_at":
                    return <p>{DateTimeFormat(cellValue)}</p>;
                case "updated_at":
                    return <p>{DateTimeFormat(cellValue)}</p>;
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
        [router, t],
    );
    //#endregion

    // const { data, error } = useSWR(
    //     "/api/acronis/tenant/children/9894ccb9-8db6-40dd-b83d-bbf358464783",
    // );
    const { data, error } = useSWR(
        "/api/acronis/tenant/children/" + currUser?.acronisUUID,
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <div className="flex flex-col gap-4">
                <PageHeader title={t("clients")} />
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            </div>
        );
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("clients")} />
            <DataTable
                isCompact
                isStriped
                data={data?.children?.items ?? []}
                columns={columns}
                renderCell={renderCell}
                defaultRowsPerPage={20}
                emptyContent={t("emptyContent")}
                sortOption={sort}
                initialVisibleColumNames={visibleColumns}
                activeOptions={[]}
                // onAddNew={}
                onDoubleClick={(item) => {
                    router.push("clients/" + item?.id);
                }}
            />
        </div>
    );
}
