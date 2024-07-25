import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import DataTable from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LuChevronsUpDown } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

export default function ApprovedTab() {
    const router = useRouter();
    const t = useTranslations("General");

    const { data, error, isLoading } = useSWR(
        `/api/application?status=approved`,
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
            accessorKey: "companyType",
            header: t("companyType"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("companyType");

                return t(data) || "-";
            },
        },
        {
            accessorKey: "applicationDate",
            header: t("applicationDate"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("applicationDate");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "approvedAt",
            header: t("approvedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("approvedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "approvedBy",
            header: t("approvedBy"),
            enableGlobalFilter: false,
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
            data={data || []}
            columns={columns}
            visibleColumns={visibleColumns}
            isLoading={isLoading}
            onClick={(item) => {
                router.push("/panel/applications/" + item.original.id);
            }}
        />
    );
}
