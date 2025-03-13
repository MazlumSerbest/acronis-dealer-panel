import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";

import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function PartnerTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error, isLoading } = useSWR(
        `/api/user?partnerAcronisId=${currentUser?.partnerAcronisId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = {};

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
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "email",
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("email")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("email");

                return data || "-";
            },
        },
        {
            accessorKey: "emailVerified",
            header: t("emailVerified"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("emailVerified");

                const emailVerified: boolean = data?.length > 0;
                return <BoolChip size="size-4" value={emailVerified} />;
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
            data={data || []}
            visibleColumns={visibleColumns}
            defaultSort="createdAt"
            defaultSortDirection="desc"
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
    );
}
