"use client";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/table/DataTable";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DateTimeFormat } from "@/utils/date";
import useUserStore from "@/store/user";

export default function LicenseHistoryPage() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();
    
    const { data, error, isLoading } = useSWR(
        `/api/licenseHistory?partnerAcronisId=${currentUser?.partnerAcronisId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = {
        createdBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "licenseSerialNo",
            header: t("serialNo"),
            cell: ({ row }) => {
                const data: string = row.getValue("licenseSerialNo");

                return data || "-";
            },
        },
        {
            accessorKey: "productName",
            header: t("productName"),
            cell: ({ row }) => {
                const data: string = row.getValue("productName");

                return data || "-";
            },
        },
        {
            accessorKey: "previousPartner",
            header: t("previousPartner"),
            cell: ({ row }) => {
                const data: string = row.getValue("previousPartner");

                return data || "-";
            },
        },
        {
            accessorKey: "partner",
            header: t("partner"),
            cell: ({ row }) => {
                const data: string = row.getValue("partner");

                return data || "-";
            },
        },
        {
            accessorKey: "customer",
            header: t("customer"),
            cell: ({ row }) => {
                const data: string = row.getValue("customer");

                return data || "-";
            },
        },
        {
            accessorKey: "action",
            header: t("action"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("action");

                return t(data) || "-";
            },
            filterFn: (row, id, value) => value == row.getValue(id),
        },
        {
            accessorKey: "createdAt",
            header: t("actionDate"),
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
    ];
    //#endregion

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
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
            defaultPageSize={50}
            facetedFilters={[
                {
                    column: "action",
                    title: t("action"),
                    options: [
                        {
                            value: "firstAssignment",
                            label: t("firstAssignment"),
                        },
                        { value: "assignment", label: t("assignment") },
                        { value: "activation", label: t("activation") },
                    ],
                },
            ]}
        />
    );
}
