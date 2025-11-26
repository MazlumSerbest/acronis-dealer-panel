import { useState } from "react";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";

import {
    LuChevronsUpDown,
    LuBuilding2,
    LuFolderOpen,
    LuShieldCheck,
} from "react-icons/lu";
import { formatBytes } from "@/utils/functions";
import { cn } from "@/lib/utils";
import useSWR from "swr";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function CustomersTab({ t, tenant }: Props) {
    const router = useRouter();

    const [updatedChildren, setUpdatedChildren] = useState();

    // #region Fetch Data
    const {
        data: children,
        error,
        isLoading,
        mutate,
    } = useSWR(`/api/acronis/tenants/children/${tenant.id}`, null, {
        onSuccess: async (data) => {
            if (!data) return;

            try {
                const [customersResponse, partnersResponse] = await Promise.all(
                    [
                        fetch(`/api/customer?partnerAcronisId=${tenant.id}`),
                        fetch(`/api/partner?parentAcronisId=${tenant.id}`),
                    ],
                );

                const [customers, partners] = await Promise.all([
                    customersResponse.json(),
                    partnersResponse.json(),
                ]);

                const newData = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    kind: item.kind,
                    enabled: item.enabled,
                    mfa_status: item.mfa_status,
                    billingDate:
                        item.kind === "customer"
                            ? customers.find(
                                  (c: Customer) => c.acronisId === item.id,
                              )?.billingDate
                            : partners.find(
                                  (p: Partner) => p.acronisId === item.id,
                              )?.billingDate,
                    usages: item.usages,
                }));

                setUpdatedChildren(newData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
    });
    // #endregion

    // #region Table
    const visibleColumns = { created_at: false, updated_at: false };

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
                const kind: string = row.getValue("kind");

                return (
                    <div className="flex items-center gap-4">
                        {kind === "partner" ? (
                            <LuBuilding2 className="size-4 min-w-4 text-blue-400" />
                        ) : kind === "customer" ? (
                            <LuShieldCheck className="size-4 min-w-4 text-blue-400" />
                        ) : kind === "folder" ? (
                            <LuFolderOpen className="size-4 min-w-4 text-blue-400" />
                        ) : (
                            <></>
                        )}
                        {data}
                    </div>
                );
            },
        },
        {
            accessorKey: "kind",
            header: t("kind"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("kind");

                return t(data);
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return <BoolChip size="size-4" value={data == "enabled"} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "usages",
            enableHiding: false,
            enableGlobalFilter: false,
            header: () => (
                <div className="flex flex-col gap-2 py-3">
                    <span className="mx-auto">{`${t("totalUsages")} / ${t(
                        "quota",
                    )}`}</span>

                    <div className="grid grid-cols-2 justify-items-center">
                        <p className="flex flex-row gap-2">
                            {t("perWorkload")}
                        </p>
                        <p className="flex flex-row gap-2">{t("perGB")}</p>
                    </div>
                </div>
            ),
            cell: ({ row }) => {
                const data: any = row.getValue("usages");

                return (
                    <div className="grid grid-cols-2 justify-items-center">
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    !data?.perWorkload?.quota ||
                                        data?.perWorkload?.quota?.value === null
                                        ? ""
                                        : data?.perWorkload?.value >
                                          data?.perWorkload?.quota?.value
                                        ? "text-destructive"
                                        : data?.perWorkload?.value >
                                          data?.perWorkload?.quota?.value * 0.9
                                        ? "text-yellow-500"
                                        : "",
                                )}
                            >
                                {data?.perWorkload?.value
                                    ? formatBytes(data?.perWorkload?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perWorkload?.quota &&
                                data?.perWorkload?.quota?.value !== null
                                    ? ` / ${formatBytes(
                                          data?.perWorkload?.quota?.value,
                                      )}`
                                    : ""}
                            </span>
                        </p>
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    !data?.perGB?.quota ||
                                        data?.perGB?.quota?.value === null
                                        ? ""
                                        : data?.perGB?.value >
                                          data?.perGB?.quota?.value
                                        ? "text-destructive"
                                        : data?.perGB?.value >
                                          data?.perGB?.quota?.value * 0.9
                                        ? "text-yellow-500"
                                        : "",
                                )}
                            >
                                {data?.perGB?.value
                                    ? formatBytes(data?.perGB?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perGB?.quota &&
                                data?.perGB?.quota?.value !== null
                                    ? ` / ${formatBytes(
                                          data?.perGB?.quota?.value,
                                      )}`
                                    : ""}
                            </span>
                        </p>
                    </div>
                );
            },
        },
    ];
    // #endregion

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
            data={updatedChildren || children}
            columns={columns}
            visibleColumns={visibleColumns}
            defaultPageSize={50}
            defaultSort="name"
            defaultSortDirection="asc"
            facetedFilters={[
                {
                    column: "kind",
                    title: t("kind"),
                    options: [
                        { value: "partner", label: t("partner") },
                        { value: "customer", label: t("customer") },
                    ],
                },
                {
                    column: "mfa_status",
                    title: t("mfaStatus"),
                    options: [
                        {
                            value: "enabled",
                            label: t("enabled"),
                        },
                        {
                            value: "disabled",
                            label: t("disabled"),
                        },
                    ],
                },
                {
                    column: "enabled",
                    title: t("enabled"),
                    options: [
                        {
                            value: true,
                            label: t("true"),
                        },
                        {
                            value: false,
                            label: t("false"),
                        },
                    ],
                },
            ]}
            onClick={(item) => {
                router.push("/panel/customers/" + item?.original?.id);
            }}
        />
    );
}
