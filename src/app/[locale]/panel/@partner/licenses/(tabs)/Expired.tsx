import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DateFormat, DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function ExpiredTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error, isLoading } = useSWR(
        currentUser?.partnerAcronisId
            ? `/api/license?status=expired&partnerAcronisId=${currentUser?.partnerAcronisId}`
            : null,
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
            accessorKey: "expiresAt",
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
                    {t("expiresAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("expiresAt");

                return DateFormat(data);
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
            defaultSort="expiresAt"
            defaultSortDirection="desc"
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
