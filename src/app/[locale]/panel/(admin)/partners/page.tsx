"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DataTable from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LuChevronsUpDown, LuMoreHorizontal } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function PartnersPage() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error, isLoading } = useSWR(`/api/partner`);

    //#region Table
    const visibleColumns = {};

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
            accessorKey: "mobile",
            header: t("mobile"),
            cell: ({ row }) => {
                const data: string = row.getValue("mobile");
                const mobile = data ? "+90" + data : "-";

                return mobile;
            },
        },
        {
            accessorKey: "phone",
            header: t("phone"),
            cell: ({ row }) => {
                const data: string = row.getValue("phone");
                const phone = data ? "+90" + data : "-";

                return phone;
            },
        },
        {
            accessorKey: "acronisId",
            header: t("acronisId"),
            enableHiding: false,
            cell: ({ row }) => {
                const data: string = row.getValue("acronisId");

                return data || "-";
            },
        },
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: User = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <LuMoreHorizontal className="size-4" />
                            {/* <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                            >
                                <span className="sr-only">
                                    {t("toggleMenu")}
                                </span>
                            </Button> */}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    // setIsNew(false);
                                    // setOpen(true);
                                    // form.reset(data);
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
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
            zebra
            columns={columns}
            data={data || []}
            visibleColumns={visibleColumns}
            isLoading={isLoading}
            // onAddNew={() => {}}
        />
    );
}
