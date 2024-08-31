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
import useUserStore from "@/store/user";

export default function FinishedTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error } = useSWR(
        `/api/license?partnerId=${currentUser?.partnerId}&status=finished`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = {
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "product",
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
                const data: Product = row.getValue("product");

                return data?.name || "-";
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
            accessorKey: "customer",
            header: t("customerAcronisId"),
            cell: ({ row }) => {
                const data: Customer = row.getValue("customer");

                return data?.acronisId || "-";
            },
            filterFn: (rows: any, id, value) => {
                return rows.filter((row: any) => {
                    const customer = row.original.customer;
                    return customer.acronisId
                        .toLowerCase()
                        .includes(value.toLowerCase());
                });
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
            accessorKey: "product",
            header: t("quota"),
            cell: ({ row }) => {
                const data: Product = row.getValue("product");

                return data?.quota || "-";
            },
        },
        {
            accessorKey: "product",
            header: t("unit"),
            cell: ({ row }) => {
                const data: Product = row.getValue("product");

                return t(data?.unit) || "-";
            },
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
            columns={columns}
            data={data || []}
            visibleColumns={visibleColumns}
        />
    );
}
