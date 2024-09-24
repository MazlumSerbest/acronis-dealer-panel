import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DataTable } from "@/components/table/DataTable";
import { DateTimeFormat } from "@/utils/date";

export default function Chapters({
    licenseId,
    partials,
    isLoading,
    mutate,
}: {
    licenseId: string;
    partials: PartialLicense[];
    isLoading: boolean;
    mutate: () => void;
}) {
    const t = useTranslations("General");

    //#region Table
    const visibleColumns = {
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "createdAt",
            header: t("createdAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("createdAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "createdBy",
            header: t("createdBy"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("createdBy");

                return data || "-";
            },
        },
        {
            accessorKey: "updatedAt",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updatedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "updatedBy",
            header: t("updatedBy"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updatedBy");

                return data || "-";
            },
        },
    ]
    //#endregion

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-medium text-xl">
                        {t("partials")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="">
                    <DataTable
                        zebra
                        columns={columns}
                        data={partials || []}
                        visibleColumns={visibleColumns}
                        isLoading={isLoading}
                        facetedFilters={[
                            {
                                column: "active",
                                title: t("active"),
                                options: [
                                    { value: true, label: t("true") },
                                    { value: false, label: t("false") },
                                ],
                            },
                        ]}
                        onAddNew={() => {
                            // setOpen(true);
                        }}
                    />
                </CardContent>
            </Card>
        </>
    );
}
