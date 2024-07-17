import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import DataTable from "@/components/table/DataTable";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { LuChevronsUpDown } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

export default function WaitingTab() {
    const router = useRouter();
    const t = useTranslations("General");

    const { data, error, isLoading } = useSWR(`/api/application?status=waiting`);

    //#region Table
    const visibleColumns = { };

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
            accessorKey: "email",
            header: t("email"),
        },
        {
            accessorKey: "companyType",
            header: t("companyType"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("companyType");

                return data
                    ? data == "partner"
                        ? t("partner")
                        : t("customer")
                    : "-";
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
    ];
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
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
                router.push("/panel/applications/" + item.id);
            }}
        />
    );
}
