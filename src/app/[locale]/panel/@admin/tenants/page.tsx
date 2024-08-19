"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";
import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";
import { Checkbox } from "@/components/ui/checkbox";

export default function TenantsPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();
    const [selected, setSelected] = useState<string[]>([]);

    const { data, error, isLoading } = useSWR(
        `/api/acronis/tenants/children/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = { created_at: false, updated_at: false };

    const columns: ColumnDef<any, any>[] = [
        // {
        //     id: "select",
        //     header: ({ table }) => (
        //         <Checkbox
        //             checked={
        //                 table.getIsAllPageRowsSelected() ||
        //                 (table.getIsSomePageRowsSelected() && "indeterminate")
        //             }
        //             onCheckedChange={async (value) => {
        //                 await table.toggleAllPageRowsSelected(!!value);
        //                 setSelected(
        //                     table
        //                         .getSelectedRowModel()
        //                         .rows.map((row) => row.original?.id),
        //                 );
        //             }}
        //             aria-label="Select all"
        //             className="translate-y-[2px]"
        //         />
        //     ),
        //     cell: ({ table, row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={async (value) => {
        //                 await row.toggleSelected(!!value);
        //                 setSelected(
        //                     table
        //                         .getSelectedRowModel()
        //                         .rows.map((row) => row.original?.id),
        //                 );
        //             }}
        //             aria-label="Select row"
        //             className="translate-y-[2px]"
        //         />
        //     ),
        //     enableSorting: false,
        //     enableHiding: false,
        // },
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
            accessorKey: "kind",
            header: t("kind"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("kind");

                return data
                    ? data == "partner"
                        ? t("partner")
                        : t("customer")
                    : "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return <BoolChip size="size-4" value={data == "enabled"} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "usage",
            header: t("usage"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("usage");

                return data || "-";
            },
        },
        {
            accessorKey: "created_at",
            header: t("createdAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("created_at");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "updated_at",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updated_at");

                return DateTimeFormat(data);
            },
        },
    ];
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("tenants")} />
            {selected}
            {!data ? (
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            ) : (
                <DataTable
                    zebra
                    data={data?.children?.items || []}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    defaultPageSize={50}
                    isLoading={isLoading}
                    // selectable
                    // selectOnClick
                    // actions={
                    //     selected.length > 0 && [
                    //         <DropdownMenuItem key="assign">
                    //             {t("assign")}
                    //         </DropdownMenuItem>,
                    //     ]
                    // }
                    facetedFilters={[
                        {
                            column: "kind",
                            title: t("kind"),
                            options: [
                                { value: "partner", label: t("partner") },
                                { value: "customer", label: t("customer") },
                            ],
                        },
                        {
                            column: "mfa_status",
                            title: t("mfaStatus"),
                            options: [
                                { value: "enabled", label: t("enabled") },
                                { value: "disabled", label: t("disabled") },
                            ],
                        },
                        {
                            column: "enabled",
                            title: t("enabled"),
                            options: [
                                { value: true, label: t("true") },
                                { value: false, label: t("false") },
                            ],
                        },
                    ]}
                    onClick={(item) => {
                        router.push("tenants/" + item?.original?.id);
                    }}
                />
            )}
        </div>
    );
}
