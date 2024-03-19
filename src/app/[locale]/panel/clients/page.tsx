"use client";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import DataTable from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";
import { DateTimeFormat } from "@/utils/date";
import useUserStore from "@/store/user";
import { LuChevronsUpDown } from "react-icons/lu";

export default function ClientsPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();

    //#region Table
    const visibleColumns = { created_at: false, updated_at: false };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "name",
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
            accessorKey: "kind",
            header: t("kind"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("kind");

                return (
                    <h6>
                        {data
                            ? data == "partner"
                                ? t("partner")
                                : t("customer")
                            : "-"}
                    </h6>
                );
            },
        },
        {
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return <BoolChip value={data == "enabled"} />;
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
        {
            accessorKey: "created_at",
            header: t("createdAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("created_at");

                return <p>{DateTimeFormat(data)}</p>;
            },
        },
        {
            accessorKey: "updated_at",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updated_at");

                return <p>{DateTimeFormat(data)}</p>;
            },
        },
    ];
    //#endregion

    // const { data, error } = useSWR(
    //     "/api/acronis/tenant/children/9894ccb9-8db6-40dd-b83d-bbf358464783",
    // );
    const { data, error } = useSWR(
        `/api/acronis/tenant/children/${currentUser?.acronisTenantUUID}`,
    );

    if (error) return <div>failed to load</div>;
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("clients")} />
            {!data ? (
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            ) : (
                <DataTable
                    zebra
                    data={data?.children?.items || []}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    onDoubleClick={(item) => {
                        router.push("clients/" + item?.id);
                    }}
                />
            )}
        </div>
    );
}
