import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";

import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function AcronisTab() {
    const t = useTranslations("General");
    const tu = useTranslations("Users");
    const { user: currentUser } = useUserStore();

    const {
        data: users,
        error,
        isLoading,
        mutate,
    } = useSWR(
        `/api/acronis/users?tenantId=${currentUser?.acronisTenantId}&withAccessPolicies=true`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Table
    const visibleColumns = {
        contactTypes: false,
    };

    const columns: ColumnDef<TenantUser, any>[] = [
        {
            accessorKey: "login",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("username")}
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
            accessorKey: "contactFullName",
            header: t("fullName"),
            enableHiding: false,
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");
                const name =
                    contact?.firstname && contact?.lastname
                        ? contact.firstname + " " + contact.lastname
                        : contact?.firstname || contact?.lastname || null;

                return name || "-";
            },
        },
        {
            accessorKey: "contactEmail",
            header: t("email"),
            enableHiding: false,
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");

                return contact?.email || "-";
            },
        },
        {
            accessorKey: "contactPhone",
            header: t("phone"),
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");

                return contact?.phone || "-";
            },
        },
        {
            accessorKey: "activated",
            header: t("activated"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("activated");

                return <BoolChip size="size-4" value={data} />;
            },
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip size="size-4" value={data} />;
            },
        },
        {
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return (
                    <BoolChip
                        size="size-4"
                        value={data === "enabled" ? true : false}
                    />
                );
            },
        },
        {
            accessorKey: "notifications",
            header: t("notifications"),
            cell: ({ row }) => {
                const notifications: string[] = row.getValue("notifications");

                if (!notifications || notifications.length < 1) return "-";
                return (
                    <div className="*:before:content-['•'] *:before:mr-1">
                        {notifications.map((n) => {
                            return <p key={n}>{tu("Notifications." + n)}</p>;
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "access_policies",
            header: t("roles"),
            cell: ({ row }) => {
                const accessPolicies: any[] = row.getValue("access_policies");

                if (!accessPolicies) return "-";
                return (
                    <div className="*:before:content-['•'] *:before:mr-1">
                        {accessPolicies.map((r) => {
                            return (
                                <p key={r.role_id}>
                                    {tu("Roles." + r.role_id)}
                                </p>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "contactTypes",
            header: t("contactTypes"),
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");

                if (!contact?.types) return "-";
                return (
                    <div className="*:before:content-['•'] *:before:mr-1">
                        {contact?.types?.map((t) => {
                            return <p key={t}>{tu("ContactTypes." + t)}</p>;
                        })}
                    </div>
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
        <>
            <DataTable
                zebra
                columns={columns}
                data={users.items.filter((u: User) => u.id) || []}
                visibleColumns={visibleColumns}
                facetedFilters={[
                    {
                        column: "activated",
                        title: t("activated"),
                        options: [
                            { value: true, label: t("true") },
                            { value: false, label: t("false") },
                        ],
                    },
                    {
                        column: "enabled",
                        title: t("enabled"),
                        options: [
                            { value: true, label: t("true") },
                            { value: false, label: t("false") },
                        ],
                    },
                ]}
            />
        </>
    );
}
