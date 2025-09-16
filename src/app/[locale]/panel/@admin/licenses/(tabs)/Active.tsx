import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LicenseHistorySheet } from "@/components/LicenseHistorySheet";
import BoolChip from "@/components/BoolChip";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown, LuHistory } from "react-icons/lu";
import { calculateRemainingDays } from "@/utils/functions";

export default function ActiveTab() {
    const t = useTranslations("General");

    const { data, error, isLoading } = useSWR(
        `/api/admin/license?status=active`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = {
        expiresAt: false,
        assignedAt: false,
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "productName",
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("name")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("productName");

                return data || "-";
            },
        },
        {
            accessorKey: "serialNo",
            header: t("serialNo"),
            cell: ({ row }) => {
                const data: string = row.getValue("serialNo");

                return data || "-";
            },
        },
        {
            accessorKey: "partnerName",
            header: t("partner"),
            cell: ({ row }) => {
                const data: string = row.getValue("partnerName");

                return data || "-";
            },
        },
        {
            accessorKey: "customerName",
            header: t("customer"),
            cell: ({ row }) => {
                const data: string = row.getValue("customerName");

                return data || "-";
            },
        },
        {
            accessorKey: "bytes",
            header: t("quota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("bytes");

                return data || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "productModel",
            header: t("model"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("productModel");

                return t(data) || "-";
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
            enableGlobalFilter: false,
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("activatedAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("activatedAt");

                return DateFormat(data);
            },
        },
        {
            accessorKey: "endsAt",
            enableGlobalFilter: false,
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("endsAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("endsAt");

                return DateFormat(data);
            },
        },
        {
            accessorKey: "remainingDays",
            header: t("remainingDays"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const endsAt: string = row.getValue("endsAt");

                return calculateRemainingDays(endsAt);
            },
        },
        {
            accessorKey: "annual",
            header: t("annual"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("annual");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "freeQuota",
            header: t("freeQuota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("freeQuota");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex flex-row gap-2">
                    <LicenseHistorySheet
                        licenseId={row.original.id}
                        trigger={
                            <LuHistory className="size-4 text-muted-foreground cursor-pointer hover:text-blue-400 active:text-blue-400/60" />
                        }
                    />
                </div>
            ),
        },
    ];
    //#endregion

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (isLoading)
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
            defaultSort="completionDate"
            defaultSortDirection="asc"
            facetedFilters={[
                {
                    column: "bytes",
                    title: t("quota"),
                    options: Array.from(
                        new Set(data?.map((item: any) => item.bytes)),
                        (bytes) => ({
                            value: bytes as any,
                            label: bytes as string,
                        }),
                    ),
                },
                {
                    column: "productModel",
                    title: t("model"),
                    options: [
                        { value: "perWorkload", label: t("perWorkload") },
                        { value: "perGB", label: t("perGB") },
                    ],
                },
            ]}
        />
    );
}
