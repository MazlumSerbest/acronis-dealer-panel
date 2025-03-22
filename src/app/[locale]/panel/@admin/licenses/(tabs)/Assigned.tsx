import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LicenseHistorySheet } from "@/components/LicenseHistorySheet";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { createZPLFromIds } from "@/utils/createZPL";
import { createPDF } from "@/utils/zpl";
import { LuChevronsUpDown, LuHistory } from "react-icons/lu";

export default function AssignedTab() {
    const t = useTranslations("General");

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data, error, isLoading } = useSWR(
        `/api/admin/license?status=assigned`,
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
            id: "select",
            enableSorting: false,
            enableHiding: false,
            enableGlobalFilter: false,
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={async (value) => {
                        await table.toggleAllPageRowsSelected(!!value);
                        setSelectedIds(
                            table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original?.id),
                        );
                    }}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ table, row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={async (value) => {
                        await row.toggleSelected(!!value);
                        setSelectedIds(
                            table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original?.id),
                        );
                    }}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
        },
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
            header: t("partnerName"),
            cell: ({ row }) => {
                const data: string = row.getValue("partnerName");

                return data || "-";
            },
        },
        {
            accessorKey: "productQuota",
            header: t("quota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("productQuota");
                const unit: string = row.original.productUnit;

                return `${data} ${unit === "GB" ? unit : ""}`;
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
                    {t("assignedAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
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
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div
                    className="flex flex-row gap-2"
                    onClick={(event) => event.stopPropagation()}
                >
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
            selectable
            columns={columns}
            data={data || []}
            visibleColumns={visibleColumns}
            defaultSort="expiresAt"
            defaultSortDirection="asc"
            facetedFilters={[
                {
                    column: "productQuota",
                    title: t("quota"),
                    options: [
                        { value: 1, label: "1" },
                        { value: 25, label: "25GB" },
                        { value: 50, label: "50GB" },
                        { value: 100, label: "100GB" },
                    ],
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
            actions={
                selectedIds.length > 0 && [
                    <DropdownMenuItem
                        key="print"
                        onClick={async () => {
                            if (selectedIds.length > 25) {
                                toast({
                                    variant: "destructive",
                                    title: t("errorTitle"),
                                    description: t("printLimit"),
                                });
                                return;
                            }

                            const zpl: any = await createZPLFromIds(
                                selectedIds,
                            );

                            createPDF(zpl);

                            // await printZPL(zpl).then((res: any) => {
                            //     if (res.ok) {
                            //         toast({
                            //             description:
                            //                 "Sended to printed successfully!",
                            //         });
                            //         mutate();
                            //     } else {
                            //         toast({
                            //             variant: "destructive",
                            //             title: t("errorTitle"),
                            //             description: res?.message?.message,
                            //         });
                            //     }
                            // });
                        }}
                    >
                        {t("printSelected")}
                    </DropdownMenuItem>,
                ]
            }
            selectOnClick={async (table, row) => {
                await row.toggleSelected();
                setSelectedIds(
                    table
                        .getSelectedRowModel()
                        .rows.map((r: any) => r.original?.id),
                );
            }}
            onSearchEnter={(table, value, setValue) => {
                const license = data?.find(
                    (d: License) => d.serialNo === value,
                );
                if (license) {
                    const selected: any = table
                        .getRowModel()
                        .rows.find(
                            (row: any) => row.original.serialNo === value,
                        );

                    selected.toggleSelected(true);
                    setValue("");
                    setSelectedIds([license.id, ...selectedIds]);
                }
            }}
        />
    );
}
