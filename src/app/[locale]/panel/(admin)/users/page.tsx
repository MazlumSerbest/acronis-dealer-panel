"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import DataTable from "@/components/table/DataTable";
import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";
import BoolChip from "@/components/BoolChip";

export default function UsersPage() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error, isLoading } = useSWR(`/api/user`);

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
            accessorKey: "email",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("email")}
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
                const data: string = row.getValue("email");

                return data || "-";
            },
        },
        {
            accessorKey: "role",
            header: t("role"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("role");

                return t(data) || "-";
            },
        },
        // {
        //     accessorKey: "acronisTenantId",
        //     header: t("acronisTenantId"),
        //     enableGlobalFilter: false,
        // },
        {
            accessorKey: "active",
            header: t("active"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("active");

                return <BoolChip value={data} />;
            },
        }
    ];
    //#endregion

    if (error) return <div>failed to load</div>;
    return (
        <DataTable
            zebra
            columns={columns}
            data={data}
            visibleColumns={visibleColumns}
            isLoading={isLoading}
            onAddNew={() => null}
        />
    );
}
