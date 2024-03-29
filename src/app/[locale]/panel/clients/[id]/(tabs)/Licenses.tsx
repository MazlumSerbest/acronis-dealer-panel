import React, { Key, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import DataTable from "@/components/table/DataTable";
import { LuChevronsUpDown } from "react-icons/lu";

export default function LicensesTab(t: Function, tenant: Tenant) {
    const router = useRouter();

    //#region Table
    const visibleColumns = {
        "": false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "name",
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
            accessorKey: "serialNo",
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

                return <div className="font-medium">{data || "-"}</div>;
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
    ];
    //#endregion

    return (
        <DataTable
            zebra
            data={[]}
            columns={columns}
            onDoubleClick={(item) => {
                router.push("/panel/licenses/" + item.id);
            }}
        />
    );
}
