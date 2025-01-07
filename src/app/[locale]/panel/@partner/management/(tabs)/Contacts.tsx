import { useState, useCallback } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import AcronisWarning from "@/components/AcronisWarning";
import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function ContactsTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();
    const [contacts, setContacts] = useState<TenantContact[]>([]);

    //#region Table
    const columns: ColumnDef<TenantContact, any>[] = [
        {
            accessorKey: "fullName",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("fullName")}
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
                const fullName: string = (
                    row.original.firstname +
                    " " +
                    row.original.lastname
                ).trim();

                return <div>{fullName || "-"}</div>;
            },
        },
        {
            accessorKey: "email",
            header: t("email"),
        },
        {
            accessorKey: "phone",
            header: t("phone"),
            enableGlobalFilter: false,
        },
        {
            accessorKey: "title",
            header: t("title"),
        },
        {
            accessorKey: "types",
            header: t("types"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: [] = row.getValue("types");

                return data.map((type) => t(type)).join(", ");
            },
        },
        {
            accessorKey: "user",
            header: t("user"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("user");

                return <BoolChip size="size-4" value={data} />;
            },
        },
    ];
    //#endregion

    const { data, error, isLoading } = useSWR(
        `/api/acronis/tenants/${currentUser?.acronisTenantId}/contacts`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                setContacts(
                    data.items.filter(
                        (c: TenantContact) => !c.types?.includes("legal"),
                    ),
                );
            },
        },
    );

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (!contacts)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-4">
            <AcronisWarning />
            <DataTable
                columns={columns}
                data={contacts}
                isLoading={isLoading}
            />
        </div>
    );
}
