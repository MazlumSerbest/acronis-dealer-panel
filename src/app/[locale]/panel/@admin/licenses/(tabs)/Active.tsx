import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";

export default function ActiveTab() {
    const t = useTranslations("General");
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/license?status=active`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = {
        expiresAt: false,
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
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
            accessorKey: "serialNo",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("serialNo")}
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
                const data: string = row.getValue("serialNo");

                return data || "-";
            },
        },
        {
            accessorKey: "partner",
            header: t("partnerName"),
            cell: ({ row }) => {
                const data: Partner = row.getValue("partner");

                return data.name || "-";
            },
            filterFn: (rows: any, id, value) => {
                return rows.filter((row: any) => {
                    const partner = row.original.partner;
                    return partner.name
                        .toLowerCase()
                        .includes(value.toLowerCase());
                });
            },
        },
        {
            accessorKey: "client",
            header: t("clientAcronisId"),
            cell: ({ row }) => {
                const data: Client = row.getValue("client");

                return data.acronisId || "-";
            },
            filterFn: (rows: any, id, value) => {
                return rows.filter((row: any) => {
                    const client = row.original.client;
                    return client.acronisId
                        .toLowerCase()
                        .includes(value.toLowerCase());
                });
            },
        },
        {
            accessorKey: "expiresAt",
            header: t("expiresAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("expiresAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "assignedAt",
            header: t("assignedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("assignedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "activatedAt",
            header: t("activatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("activatedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "duration",
            header: t("duration"),
            enableGlobalFilter: false,
        },
        {
            accessorKey: "quota",
            header: t("quota"),
            enableGlobalFilter: false,
        },
        {
            accessorKey: "type",
            header: t("type"),
            enableGlobalFilter: false,
        },
        {
            accessorKey: "createdAt",
            header: t("createdAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("createdAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "createdBy",
            header: t("createdBy"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("createdBy");

                return data || "-";
            },
        },
        {
            accessorKey: "updatedAt",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updatedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "updatedBy",
            header: t("updatedBy"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updatedBy");

                return data || "-";
            },
        },
    ];
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return (
        <DataTable
            zebra
            columns={columns}
            data={data || []}
            visibleColumns={visibleColumns}
        />
    );
}
