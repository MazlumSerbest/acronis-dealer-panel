"use client";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";

import { LuChevronsUpDown } from "react-icons/lu";
import { DateFormat, DateTimeFormat } from "@/utils/date";
import { cities } from "@/lib/constants";

export default function ContactedTab() {
    const t = useTranslations("General");
    const router = useRouter();

    const { data, error, isLoading } = useSWR(
        `/api/admin/potentialPartner?status=contacted`,
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
            accessorKey: "authorizedPerson",
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("authorizedPerson")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("authorizedPerson");

                return data || "-";
            },
        },
        {
            accessorKey: "companyType",
            header: t("companyType"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("companyType");

                return data ? t(data) : "-";
            },
        },
        {
            accessorKey: "email",
            header: t("email"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("email");

                return data ? data : "-";
            },
        },
        {
            accessorKey: "contactedAt",
            header: t("contactedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("contactedAt");

                return DateFormat(data);
            },
        },
        {
            accessorKey: "city",
            header: t("city"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("city");

                return data ? cities.find((c) => c.code === data)?.name : "-";
            },
            filterFn: (row, id, value) => {
                const city = row.getValue(id) as number;
                const selectedCity = value as string;

                return city === Number(selectedCity);
            },
        },
        {
            accessorKey: "note",
            header: t("note"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("note");

                return (
                    <p>
                        {data
                            ? data.length > 30
                                ? data.substring(0, 30) + "..."
                                : data
                            : "-"}
                    </p>
                );
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
            columns={columns}
            data={data}
            visibleColumns={visibleColumns}
            defaultPageSize={50}
            facetedFilters={[
                {
                    column: "companyType",
                    title: t("companyType"),
                    options: [
                        {
                            value: "business",
                            label: t("business"),
                        },
                        {
                            value: "person",
                            label: t("person"),
                        },
                    ],
                },
                {
                    column: "city",
                    title: t("city"),
                    options: cities.map((city) => ({
                        value: city.code,
                        label: city.name,
                    })),
                },
            ]}
            onClick={(item) => {
                router.push("potentialPartners/" + item?.original?.id);
            }}
        />
    );
}
