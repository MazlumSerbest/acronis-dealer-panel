"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";

import { LuChevronsUpDown, LuLoaderCircle, LuEllipsisVertical } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import FormError from "@/components/FormError";

const partnerFormSchema = z.object({
    acronisId: z.string().uuid().optional(),
    active: z.boolean(),
    licensed: z.boolean(),
    parasutId: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function PartnersPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Partner");
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [parasutContactName, setParasutContactName] = useState<string>();
    const [parasutNameLoading, setParasutNameLoading] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/partner`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                setPartners(
                    data.filter(
                        (partner: Partner) =>
                            partner.acronisId !==
                            "15229d4a-ff0f-498b-849d-a4f71bdc81a4",
                    ),
                );
            },
        },
    );

    //#region Form
    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
        defaultValues: {
            // active: true,
            // licensed: true,
        },
    });

    function onSubmit(values: PartnerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(`/api/admin/partner/${values.acronisId}`, {
            method: "PUT",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpen(false);
                    mutate();
                    form.reset();
                } else {
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }
            })
            .finally(() => setSubmitting(false));
    }
    //#endregion

    //#region Table
    const visibleColumns = {
        subPartnerCount: false,
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

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

                return data || "-";
            },
        },
        {
            accessorKey: "acronisId",
            header: t("acronisId"),
            enableHiding: false,
            cell: ({ row }) => {
                const data: string = row.getValue("acronisId");

                return data || "-";
            },
        },
        {
            accessorKey: "parent",
            header: t("upperPartner"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const parent: Partner = row.getValue("parent");

                return (
                    (parent?.acronisId ===
                    "15229d4a-ff0f-498b-849d-a4f71bdc81a4"
                        ? "-"
                        : parent?.name) || "-"
                );
            },
        },
        // {
        //     accessorKey: "_count",
        //     header: t("subPartnerCount"),
        //     enableGlobalFilter: false,
        //     cell: ({ row }) => {
        //         const count: { children: number } = row.getValue("_count");

        //         return count.children || "-";
        //     },
        // },
        {
            accessorKey: "_count",
            header: t("customerCount"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const count: { customers: number } = row.getValue("_count");

                return count.customers || "-";
            },
        },
        {
            accessorKey: "licensed",
            header: t("licensedPartner"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("licensed");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "active",
            header: t("active"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("active");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "parasutId",
            header: "Paraşüt",
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("parasutId");
                const enabled: boolean = data ? true : false;

                return <BoolChip size="size-4" value={enabled} />;
            },
            filterFn: (row, id, value) => {
                const data: string = row.getValue(id);
                const enabled: boolean = data ? true : false;

                return value.includes(enabled);
            },
        },
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
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: Partner = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuEllipsisVertical className="size-4 text-muted-foreground cursor-pointer hover:text-blue-500 active:text-blue-500/60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            {data?.application && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        router.push(
                                            `/panel/applications/${data.application?.id}`,
                                        );
                                    }}
                                >
                                    {t("goToApplication")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => {
                                    router.push(
                                        `/panel/tenants/${data.acronisId}`,
                                    );
                                }}
                            >
                                {t("goToTenant")}
                            </DropdownMenuItem>

                            {data._count.customers > 0 && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        router.push(
                                            `/panel/tenants/${data.acronisId}?tab=clients`,
                                        );
                                    }}
                                >
                                    {t("customers")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => {
                                    router.push(
                                        `/panel/users?search=${data.acronisId}`,
                                    );
                                }}
                            >
                                {t("users")}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={async () => {
                                    setOpen(true);
                                    form.reset(data);
                                    setParasutContactName(undefined);

                                    if (data.parasutId) {
                                        setParasutNameLoading(true);

                                        await fetch(
                                            `/api/parasut/contacts/${data.parasutId}`,
                                        )
                                            .then((res) => res.json())
                                            .then((res) => {
                                                if (res.ok === false)
                                                    setParasutContactName(
                                                        t("customerNotFound"),
                                                    );
                                                else
                                                    setParasutContactName(
                                                        res.attributes.name,
                                                    );
                                            })
                                            .finally(() =>
                                                setParasutNameLoading(false),
                                            );
                                    }
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>{t("delete")}</DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
            <div className="flex flex-col gap-4">
                <PageHeader title={t("partners")} />

                <DataTable
                    zebra
                    columns={columns}
                    data={partners}
                    visibleColumns={visibleColumns}
                    defaultPageSize={50}
                    facetedFilters={[
                        {
                            column: "licensed",
                            title: t("licensed"),
                            options: [
                                { value: true, label: t("true") },
                                { value: false, label: t("false") },
                            ],
                        },
                        {
                            column: "active",
                            title: t("active"),
                            options: [
                                { value: true, label: t("true") },
                                { value: false, label: t("false") },
                            ],
                        },
                        {
                            column: "parasutId",
                            title: t("parasutIntegration"),
                            options: [
                                { value: true, label: t("available") },
                                { value: false, label: t("unavailable") },
                            ],
                        },
                    ]}
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("editPartner")}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>{t("active")}</FormLabel>
                                            <FormDescription>
                                                {tf("active.description")}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="licensed"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                {t("licensedPartner")}
                                            </FormLabel>
                                            <FormDescription>
                                                {tf("licensed.description")}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parasutId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("parasutId")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={async (e) => {
                                                    form.setValue(
                                                        "parasutId",
                                                        e.target.value,
                                                    );

                                                    setParasutContactName(
                                                        undefined,
                                                    );
                                                    if (e.target.value) {
                                                        setParasutNameLoading(
                                                            true,
                                                        );

                                                        await fetch(
                                                            `/api/parasut/contacts/${e.target.value}`,
                                                        )
                                                            .then((res) =>
                                                                res.json(),
                                                            )
                                                            .then((res) => {
                                                                if (
                                                                    res.ok ===
                                                                    false
                                                                )
                                                                    setParasutContactName(
                                                                        t(
                                                                            "customerNotFound",
                                                                        ),
                                                                    );
                                                                else
                                                                    setParasutContactName(
                                                                        res
                                                                            .attributes
                                                                            .name,
                                                                    );
                                                            })
                                                            .finally(() =>
                                                                setParasutNameLoading(
                                                                    false,
                                                                ),
                                                            );
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        {parasutNameLoading && (
                                            <FormDescription>
                                                <LuLoaderCircle className="size-4 animate-spin absolute right-2 top-2" />
                                            </FormDescription>
                                        )}
                                        {parasutContactName && (
                                            <FormDescription className="">
                                                {parasutContactName}
                                            </FormDescription>
                                        )}
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.parasutId
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">
                                        {t("close")}
                                    </Button>
                                </DialogClose>
                                <Button
                                    disabled={submitting}
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-600/90"
                                >
                                    {t("save")}
                                    {submitting && (
                                        <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
