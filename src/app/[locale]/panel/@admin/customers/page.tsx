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

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";

import {
    LuChevronsUpDown,
    LuLoaderCircle,
    LuEllipsisVertical,
} from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

export default function CustomersPage() {
    const t = useTranslations("General");
    const router = useRouter();

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/customer`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                console.log(data);
            },
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
            accessorKey: "name",
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
                const data: string = row.getValue("name");

                return data || "-";
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
            accessorKey: "partner",
            header: t("partner"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const partner: Partner = row.getValue("partner");

                return partner?.name || "-";
            },
        },
        {
            accessorKey: "partner",
            header: t("licensed"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: Partner = row.getValue("partner");

                return <BoolChip size="size-4" value={data.licensed} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "active",
            header: t("active"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("active");

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
            cell: ({ row }) => {
                const data: Partner = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuEllipsisVertical className="size-4 text-muted-foreground cursor-pointer hover:text-blue-400 active:text-blue-400/60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            {data?.application && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        router.push(
                                            `/panel/applications/${data.application?.id}`,
                                        );
                                    }}
                                >
                                    {t("goToApplication")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => {
                                    router.push(
                                        `/panel/tenants/${data.acronisId}`,
                                    );
                                }}
                            >
                                {t("goToCustomer")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    router.push(
                                        `/panel/tenants/${data.partner?.acronisId}`,
                                    );
                                }}
                            >
                                {t("goToPartner")}
                            </DropdownMenuItem>

                            {/* <DropdownMenuItem
                                onClick={async () => {
                                    setOpen(true);
                                    form.reset(data);
                                    setParasutContactName(undefined);

                                    if (data.parasutId) {
                                        setParasutNameLoading(true);

                                        await fetch(
                                            `/api/parasut/contacts/${data.parasutId}`,
                                        )
                                            .then((res) => res.json())
                                            .then((res) => {
                                                if (res.ok === false)
                                                    setParasutContactName(
                                                        t("customerNotFound"),
                                                    );
                                                else
                                                    setParasutContactName(
                                                        res.attributes.name,
                                                    );
                                            })
                                            .finally(() =>
                                                setParasutNameLoading(false),
                                            );
                                    }
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
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
        <div className="flex flex-col gap-4">
            <PageHeader title={t("customers")} />

            <DataTable
                zebra
                columns={columns}
                data={data}
                visibleColumns={visibleColumns}
                defaultPageSize={50}
                facetedFilters={[
                    {
                        column: "active",
                        title: t("active"),
                        options: [
                            { value: true, label: t("true") },
                            { value: false, label: t("false") },
                        ],
                    },
                ]}
            />
        </div>
    );
}
