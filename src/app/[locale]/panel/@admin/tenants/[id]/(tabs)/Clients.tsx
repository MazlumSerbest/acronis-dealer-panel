import React from "react";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";

type Props = {
    t: Function;
    clients: Tenant[];
};

export default function ClientsTab({ t, clients }: Props) {
    const router = useRouter();

    //#region Table
    const visibleColumns = { created_at: false, updated_at: false };

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
            accessorKey: "kind",
            header: t("kind"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("kind");

                return (
                    <h6>
                        {data
                            ? data == "partner"
                                ? t("partner")
                                : t("customer")
                            : "-"}
                    </h6>
                );
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

                return <p>{DateTimeFormat(data)}</p>;
            },
        },
        {
            accessorKey: "updated_at",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updated_at");

                return <p>{DateTimeFormat(data)}</p>;
            },
        },
    ];
    //#endregion

    return (
        <DataTable
            zebra
            data={clients || []}
            columns={columns}
            visibleColumns={visibleColumns}
            defaultPageSize={50}
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
                router.push("/panel/tenants/" + item?.original?.id);
            }}
        />
    );
}
