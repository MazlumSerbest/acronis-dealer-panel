import React, { Key, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import { LuChevronsUpDown } from "react-icons/lu";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function LicensesTab(props: Props) {
    const { t, tenant } = props;
    
    const router = useRouter();

    //#region Table
    const visibleColumns = {
        "": false,
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
            onAddNew={() => null}
            onClick={(item) => {
                // Müşterinin lisans sayfasına yönlendir
                router.push("/panel/licenses/" + item.id);
            }}
        />
    );
}
