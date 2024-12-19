import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import AcronisWarning from "@/components/AcronisWarning";
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
            enableHiding: false,
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

                return data || "-";
            },
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip size="size-4" value={data} />;
            },
        },
    ];
    //#endregion

    const { data, error, isLoading } = useSWR(
        `/api/acronis/tenants/users/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                setUsers(data.users?.items);
            },
        },
    );

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
        <div className="flex flex-col gap-4">
            <AcronisWarning />
            <DataTable columns={columns} data={users} isLoading={isLoading} />
        </div>
    );
}
