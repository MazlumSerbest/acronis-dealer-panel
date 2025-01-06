import React from "react";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import { DateFormat } from "@/utils/date";
import { LuAlertTriangle, LuChevronsUpDown, LuInfo } from "react-icons/lu";
import { calculateRemainingDays, formatBytes } from "@/utils/functions";
import { cn } from "@/lib/utils";

type Props = {
    t: Function;
    clients: Tenant[];
};

export default function ClientsTab({ t, clients }: Props) {
    const router = useRouter();

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

                return (
                    <h6>
                        {data
                            ? data === "partner"
                                ? t("partner")
                                : t("customer")
                            : "-"}
                    </h6>
                );
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
            accessorKey: "licensed",
            header: t("licensed"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("licensed");
                const kind: string = row.getValue("kind");

                return kind === "partner" ? (
                    <BoolChip size="size-4" value={data} />
                ) : (
                    "-"
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "billingDate",
            enableHiding: false,
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

                return (
                    <div className="flex flex-row gap-2">
                        {DateFormat(data)}
                        {data &&
                            (new Date(data) < new Date() ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <LuAlertTriangle className="size-4 text-destructive" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("billingDatePassed")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : new Date(data) <
                              new Date(Date.now() + 12096e5) ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <LuInfo className="size-4 text-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {t("lessThanTwoWeeksUntilBilling")}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : null)}
                    </div>
                );
            },
        },
        {
            accessorKey: "remainingDays",
            header: t("remainingDays"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("billingDate");
                const remainingDays = calculateRemainingDays(data);

                return data ? (remainingDays > 0 ? remainingDays : "0") : "-";
            },
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
                                    data?.perWorkload?.quota &&
                                        data?.perWorkload?.quota?.value !==
                                            null &&
                                        data?.perWorkload?.value >
                                            data?.perWorkload?.quota?.value
                                        ? "text-destructive"
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
                                    data?.perGB?.quota &&
                                        data?.perGB?.quota?.value !== null &&
                                        data?.perGB?.value >
                                            data?.perGB?.quota?.value
                                        ? "text-destructive"
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
    //#endregion

    return (
        <DataTable
            zebra
            data={clients || []}
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
                        { value: "enabled", label: t("enabled") },
                        { value: "disabled", label: t("disabled") },
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
                    column: "licensed",
                    title: t("licensed"),
                    options: [
                        { value: true, label: t("true") },
                        { value: false, label: t("false") },
                    ],
                },
            ]}
            onClick={(item) => {
                router.push("/panel/tenants/" + item?.original?.id);
            }}
        />
    );
}
