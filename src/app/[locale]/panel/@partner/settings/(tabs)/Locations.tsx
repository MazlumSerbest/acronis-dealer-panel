"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import DataTable from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import AcronisWarning from "@/components/AcronisWarning";
import useUserStore from "@/store/user";
import { LuChevronsUpDown } from "react-icons/lu";

export default function LocationsTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();
    const [locations, setLocations] = useState([]);

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

                return <div className="font-medium">{data || "-"}</div>;
            },
        },
        {
            accessorKey: "platform_owned",
            header: t("platformOwned"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("platform_owned");

                return <BoolChip size="size-4" value={data} />;
            },
        },
    ];
    //#endregion

    const { data, error, isLoading } = useSWR(
        `/api/acronis/locations/tenant/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                setLocations(data.locations?.items);
            },
        },
    );

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!locations)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-4">
            <AcronisWarning />
            <DataTable
                columns={columns}
                data={locations || []}
                isLoading={isLoading}
            />
        </div>
    );
}
