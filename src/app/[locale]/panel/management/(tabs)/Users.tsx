import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import DataTable from "@/components/table/DataTable";
import useUserStore from "@/store/user";
import { LuChevronsUpDown } from "react-icons/lu";

export default function UsersTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();
    const [users, setUsers] = useState<TenantUser[]>([]);

    //#region Table
    const columns: ColumnDef<TenantUser, any>[] = [
        {
            accessorKey: "login",
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("login")}
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
                const data: string = row.getValue("login");

                return <div className="font-medium">{data || "-"}</div>;
            },
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip value={data} />;
            },
        },
    ];
    //#endregion

    const { data, error } = useSWR(
        `/api/acronis/tenant/users/${currentUser?.acronisTenantUUID}`,
        null,
        {
            onSuccess: (data) => {
                setUsers(data.users?.items);
            },
        },
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return <DataTable columns={columns} data={users} />;
}
