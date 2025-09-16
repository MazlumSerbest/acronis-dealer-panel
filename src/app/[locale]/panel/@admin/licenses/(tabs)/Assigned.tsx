import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LicenseHistorySheet } from "@/components/LicenseHistorySheet";
import DestructiveToast from "@/components/DestructiveToast";
import BoolChip from "@/components/BoolChip";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { createLicensePDFFromIds, createZPLFromIds } from "@/utils/documents";
import { createLicenseAsPDF, createZPLAsPDF } from "@/utils/pdf";
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
                {
                    column: "annual",
                    title: t("annual"),
                    options: [
                        { value: true, label: t("yes") },
                        { value: false, label: t("no") },
                    ],
                },
                {
                    column: "freeQuota",
                    title: t("freeQuota"),
                    options: [
                        { value: true, label: t("yes") },
                        { value: false, label: t("no") },
                    ],
                },
            ]}
            actions={
                selectedIds.length > 0 && [
                    <DropdownMenuItem
                        key="print"
                        onClick={async () => {
                            if (selectedIds.length > 25) {
                                DestructiveToast({
                                    title: t("errorTitle"),
                                    description: t("printLimit"),
                                    t,
                                });
                                return;
                            }

                            const zpl: any = await createZPLFromIds(
                                selectedIds,
                            );

                            createZPLAsPDF(zpl);
                        }}
                    >
                        {t("printSelected")}
                    </DropdownMenuItem>,
                    <DropdownMenuItem
                        key="print"
                        onClick={async () => {
                            const licenses = await createLicensePDFFromIds(
                                selectedIds,
                            );

                            createLicenseAsPDF(licenses);
                        }}
                    >
                        {t("printAsLicense")}
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
