"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";
import DestructiveToast from "@/components/DestructiveToast";

import {
    LuChevronsUpDown,
    LuLoaderCircle,
    LuEllipsisVertical,
} from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

const productFormSchema = z.object({
    id: z.string().optional(),
    active: z.boolean(),
    name: z
        .string({
            required_error: "Product.name.required",
        })
        .min(3, "Product.name.minLength"),
    code: z
        .string({
            required_error: "Product.code.required",
        })
        .min(3, "Product.code.minLength"),
    model: z.enum(["perGB", "perWorkload"]),
    quota: z.coerce.number().optional(),
    unit: z.enum(["MB", "GB", "TB"]).optional().nullable(),
    annual: z.boolean().optional(),
    freeQuota: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductsPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Product");

    const [open, setOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quotaDisabled, setQuotaDisabled] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/product`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Form
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            active: true,
            model: "perGB",
            annual: true,
            freeQuota: false,
        },
    });

    function onSubmit(values: ProductFormValues) {
        if (submitting) return;
        setSubmitting(true);

        if (isNew) {
            fetch("/api/admin/product", {
                method: "POST",
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
                        form.reset({
                            active: true,
                            model: "perGB",
                            annual: true,
                            freeQuota: false,
                        });
                    } else {
                        DestructiveToast({
                            title: t("errorTitle"),
                            description: res.message,
                            t,
                        });
                    }
                })
                .finally(() => setSubmitting(false));
        } else {
            fetch(`/api/admin/product/${values.id}`, {
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
                        form.reset({
                            active: true,
                            model: "perGB",
                            annual: true,
                        });
                    } else {
                        DestructiveToast({
                            title: t("errorTitle"),
                            description: res.message,
                            t,
                        });
                    }
                })
                .finally(() => setSubmitting(false));
        }
    }
    //#endregion

    //#region Table
    const visibleColumns = {
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
            accessorKey: "quota",
            header: t("quota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("quota");

                return data || "-";
            },
        },
        {
            accessorKey: "unit",
            header: t("unit"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("unit");

                return data ? t(data) : "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "code",
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("code")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("code");

                return data || "-";
            },
        },
        {
            accessorKey: "usageName",
            header: t("usageName"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("usageName");

                return data || "-";
            },
        },
        {
            accessorKey: "model",
            header: t("model"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("model");

                return t(data) || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "annual",
            header: t("annual"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("annual");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "freeQuota",
            header: t("freeQuota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("freeQuota");

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
                const data: Product = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuEllipsisVertical className="size-4 text-muted-foreground cursor-pointer hover:text-blue-400 active:text-blue-400/60" />
                            {/* <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                            >
                                <LuEllipsisVertical className="size-4" />
                                <span className="sr-only">
                                    {t("toggleMenu")}
                                </span>
                            </Button> */}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsNew(false);
                                    setOpen(true);
                                    form.reset(data);
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {t("delete")}
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("areYouSure")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("areYouSureDescription")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="text-sm text-muted-foreground">
                                        {t("selectedItem", { name: data.name })}
                                    </div>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            {t("close")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button
                                                disabled={submitting}
                                                variant="destructive"
                                                className="bg-destructive hover:bg-destructive/90"
                                                onClick={() => {
                                                    if (submitting) return;
                                                    setSubmitting(true);

                                                    fetch(
                                                        `/api/admin/product/${data.id}`,
                                                        {
                                                            method: "DELETE",
                                                        },
                                                    )
                                                        .then((res) =>
                                                            res.json(),
                                                        )
                                                        .then((res) => {
                                                            if (res.ok) {
                                                                toast({
                                                                    description:
                                                                        res.message,
                                                                });
                                                                mutate();
                                                            } else {
                                                                toast({
                                                                    variant:
                                                                        "destructive",
                                                                    title: t(
                                                                        "errorTitle",
                                                                    ),
                                                                    description:
                                                                        res.message,
                                                                });
                                                            }
                                                        })
                                                        .finally(() =>
                                                            setSubmitting(
                                                                false,
                                                            ),
                                                        );
                                                }}
                                            >
                                                {t("delete")}
                                                {submitting && (
                                                    <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                                )}
                                            </Button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
            <DataTable
                zebra
                columns={columns}
                data={data}
                visibleColumns={visibleColumns}
                facetedFilters={[
                    {
                        column: "unit",
                        title: t("unit"),
                        options: [
                            { value: "MB", label: t("MB") },
                            { value: "GB", label: t("GB") },
                            { value: "TB", label: t("TB") },
                        ],
                    },
                    {
                        column: "model",
                        title: t("model"),
                        options: [
                            { value: "perGB", label: t("perGB") },
                            { value: "perWorkload", label: t("perWorkload") },
                        ],
                    },
                    {
                        column: "annual",
                        title: t("annual"),
                        options: [
                            { value: true, label: t("true") },
                            { value: false, label: t("false") },
                        ],
                    },
                    {
                        column: "freeQuota",
                        title: t("freeQuota"),
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
                ]}
                onAddNew={() => {
                    setIsNew(true);
                    setOpen(true);
                    form.reset({ active: true, model: "perGB" });
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? t("newProduct") : t("editProduct")}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            {!isNew && (
                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    {t("active")}
                                                </FormLabel>
                                                <FormDescription>
                                                    {tf("active.description")}
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="annual"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>{t("annual")}</FormLabel>
                                            <FormDescription>
                                                {tf("annual.description")}
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("name")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.name
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("code")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.code
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("model")}</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* <SelectItem>
                                                </SelectItem> */}
                                                <SelectItem value="perGB">
                                                    {t("perGB")}
                                                </SelectItem>
                                                <SelectItem value="perWorkload">
                                                    {t("perWorkload")}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.model
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="freeQuota"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                {t("freeQuota")}
                                            </FormLabel>
                                            <FormDescription>
                                                {tf("freeQuota.description")}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={(value) => {
                                                    field.onChange(value);
                                                    setQuotaDisabled(value);
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                disabled={quotaDisabled}
                                control={form.control}
                                name="quota"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("quota")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.quota
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("unit")}</FormLabel>
                                        <Select
                                            disabled={quotaDisabled}
                                            value={field.value ?? undefined}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* <SelectItem>
                                                </SelectItem> */}
                                                <SelectItem value="MB">
                                                    {t("MB")}
                                                </SelectItem>
                                                <SelectItem value="GB">
                                                    {t("GB")}
                                                </SelectItem>
                                                <SelectItem value="TB">
                                                    {t("TB")}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.unit
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
