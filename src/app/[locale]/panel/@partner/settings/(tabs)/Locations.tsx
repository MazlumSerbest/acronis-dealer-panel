"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import AcronisWarning from "@/components/AcronisWarning";
import useUserStore from "@/store/user";
import { LuChevronsUpDown } from "react-icons/lu";

export default function LocationsTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    //#region Table
    const columns: ColumnDef<TenantLocation>[] = [
        {
            accessorKey: "name",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("name")}
                    <Button
                        variant="ghost"
                        className="p-1"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        <LuChevronsUpDown className="size-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("name");

                return data || "-";
            },
        },
        {
            accessorKey: "platform_owned",
            header: t("platformOwned"),
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("platform_owned");

                return <BoolChip size="size-4" value={data} />;
            },
        },
    ];
    //#endregion

    const { data, error, isLoading } = useSWR(
        `/api/acronis/tenants/${currentUser?.acronisTenantId}/locations`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-4">
            <AcronisWarning />
            <DataTable columns={columns} data={data} isLoading={isLoading} />
        </div>
    );
}
