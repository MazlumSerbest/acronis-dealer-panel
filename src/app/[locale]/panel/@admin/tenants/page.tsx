"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";

import { DateFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";
import { formatBytes } from "@/utils/functions";
import { cn } from "@/lib/utils";

export default function TenantsPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();
    const [updatedData, setUpdatedData] = useState(undefined);

    const { data, error, isLoading } = useSWR(
        currentUser?.acronisTenantId
            ? `/api/acronis/tenants/children/${currentUser.acronisTenantId}`
            : null,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: async (data) => {
                if (!data) return;

                const [customersResponse, partnersResponse] = await Promise.all(
                    [
                        fetch(
                            `/api/customer?partnerId=${currentUser?.partnerId}`,
                        ),
                        fetch(
                            `/api/partner?parentAcronisId=${currentUser?.acronisTenantId}`,
                        ),
                    ],
                );

                const [customers, partners] = await Promise.all([
                    customersResponse.json(),
                    partnersResponse.json(),
                ]);

                const newData = data.map((item: any) => {
                    const newItem = {
                        id: item.id,
                        name: item.name,
                        kind: item.kind,
                        enabled: item.enabled,
                        mfa_status: item.mfa_status,
                        billingDate: "",
                        usages: item.usages,
                    };

                    if (item.kind === "customer") {
                        const customer = customers.find(
                            (customer: Customer) =>
                                customer.acronisId === item.id,
                        );
                        newItem.billingDate =
                            customer?.billingDate || undefined;
                    } else if (item.kind === "partner") {
                        const partner = partners.find(
                            (partner: Partner) => partner.acronisId === item.id,
                        );
                        newItem.billingDate = partner?.billingDate || undefined;
                    }

                    return newItem;
                });

                setUpdatedData(newData);
            },
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

                return data || "-";
            },
        },
        {
            accessorKey: "kind",
            header: t("kind"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("kind");

                return data
                    ? data === "partner"
                        ? t("partner")
                        : t("customer")
                    : "-";
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
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return <BoolChip size="size-4" value={data === "enabled"} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "billingDate",
            enableGlobalFilter: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("billingDate")}
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
                const data: string = row.getValue("billingDate");

                return DateFormat(data);
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "usages",
            enableGlobalFilter: false,
            header: () => (
                <div className="flex flex-col gap-2 py-3">
                    <span className="mx-auto">{t("totalUsages")}</span>

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
                                    data?.perWorkload?.quota &&
                                        data?.perWorkload?.value >
                                            data?.perWorkload?.quota
                                        ? "text-destructive"
                                        : "",
                                )}
                            >
                                {data?.perWorkload?.value
                                    ? formatBytes(data?.perWorkload?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perWorkload?.quota
                                    ? ` / ${formatBytes(
                                          data?.perWorkload?.quota,
                                      )}`
                                    : ""}
                            </span>
                        </p>
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    data?.perGB?.quota &&
                                        data?.perGB?.value > data?.perGB?.quota
                                        ? "text-destructive"
                                        : "",
                                )}
                            >
                                {data?.perGB?.value
                                    ? formatBytes(data?.perGB?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perGB?.quota
                                    ? ` / ${formatBytes(data?.perGB?.quota)}`
                                    : ""}
                            </span>
                        </p>
                    </div>
                );
            },
        },
    ];
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("tenants")} />
            {!data ? (
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            ) : (
                <DataTable
                    zebra
                    data={updatedData || data}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    defaultPageSize={50}
                    isLoading={isLoading}
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
                            column: "enabled",
                            title: t("enabled"),
                            options: [
                                { value: true, label: t("true") },
                                { value: false, label: t("false") },
                            ],
                        },
                        {
                            column: "mfa_status",
                            title: t("mfaStatus"),
                            options: [
                                { value: "enabled", label: t("enabled") },
                                { value: "disabled", label: t("disabled") },
                            ],
                        },
                    ]}
                    onClick={(item) => {
                        router.push("tenants/" + item?.original?.id);
                    }}
                />
            )}
        </div>
    );
}
