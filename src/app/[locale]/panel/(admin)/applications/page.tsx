"use client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import DataTable from "@/components/table/DataTable";
import useUserStore from "@/store/user";
import { LuChevronsUpDown } from "react-icons/lu";
import BoolChip from "@/components/BoolChip";
import { DateTimeFormat } from "@/utils/date";

export default function UsersPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();

    //#region Table
    const visibleColumns = { email: false };

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
        {
            accessorKey: "acceptanceDate",
            header: t("acceptanceDate"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("acceptanceDate");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "acceptedBy",
            header: t("acceptedBy"),
            enableGlobalFilter: false,
        },
        {
            accessorKey: "status",
            header: t("status"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("accepted");

                return <BoolChip value={data} />;
            },
        },
    ];
    //#endregion

    return (
        <DataTable
            zebra
            data={[]}
            columns={columns}
            visibleColumns={visibleColumns}
            // isLoading={isLoading}
            onClick={(item) => {
                router.push("/panel/applications/" + item.id);
            }}
        />
    );
}
