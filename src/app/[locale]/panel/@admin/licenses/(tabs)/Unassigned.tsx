import { useEffect, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import BoolChip from "@/components/BoolChip";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import Combobox from "@/components/Combobox";
import FormError from "@/components/FormError";
import DestructiveToast from "@/components/DestructiveToast";

import { getPartners, getProducts } from "@/lib/data";
import useUserStore from "@/store/user";
import { DateFormat, DateTimeFormat } from "@/utils/date";
import {
    createZPLFromIds,
    createZPLFromObjects,
    createLicensePDFFromIds,
} from "@/utils/documents";
import { createLicenseAsPDF, createZPLAsPDF } from "@/utils/pdf";
import { LuChevronsUpDown, LuLoaderCircle } from "react-icons/lu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const licenseFormSchema = z.object({
    productId: z.string({
        required_error: "License.productId.required",
    }),
    piece: z.coerce
        .number({
            required_error: "License.piece.required",
        })
        .min(1, "License.piece.minLength")
        .max(2000, "License.piece.maxLength"),
    expiresAt: z.date().min(new Date(), "License.expiresAt.min").optional(),
    endsAt: z.date().min(new Date(), "License.endsAt.min").optional(),
    print: z.boolean().optional(),
    quota: z.coerce.number().optional(),
    unit: z.enum(["MB", "GB", "TB"]).optional().nullable(),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;

const assignFormSchema = z.object({
    partnerAcronisId: z
        .string({
            required_error: "License.partnerAcronisId.required",
        })
        .uuid(),
});

type AssignFormValues = z.infer<typeof assignFormSchema>;

export default function UnassignedTab() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.License");
    const { user: currentUser } = useUserStore();

    const [open, setOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [products, setProducts] = useState<ListBoxItem[] | null>(null);
    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/license?status=unassigned`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    // #region Form
    const form = useForm<LicenseFormValues>({
        resolver: zodResolver(licenseFormSchema),
        defaultValues: {
            piece: 1,
        },
    });

    function onSubmit(values: LicenseFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch("/api/admin/license", {
            method: "POST",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then(async (res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpen(false);
                    form.reset();
                    mutate();

                    if (values.print) {
                        const zpl: string = await createZPLFromObjects(
                            res.data,
                        );

                        createZPLAsPDF(zpl);
                    }
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

    const assignForm = useForm<AssignFormValues>({
        resolver: zodResolver(assignFormSchema),
    });

    function onSubmitAssign(values: AssignFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch("/api/admin/license/assign", {
            method: "PUT",
            body: JSON.stringify({ ...values, ids: selectedIds }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setSelectedIds([]);
                    setAssignOpen(false);
                    assignForm.reset();
                    mutate();
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
    // #endregion

    //#region Table
    const visibleColumns = {
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            id: "select",
            enableSorting: false,
            enableHiding: false,
            enableGlobalFilter: false,
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={async (value) => {
                        await table.toggleAllPageRowsSelected(!!value);
                        setSelectedIds(
                            table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original?.id),
                        );
                    }}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ table, row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={async (value) => {
                        await row.toggleSelected(!!value);
                        setSelectedIds(
                            table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original?.id),
                        );
                    }}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
        },
        {
            accessorKey: "productName",
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
                const data: string = row.getValue("productName");

                return data || "-";
            },
        },
        {
            accessorKey: "serialNo",
            header: t("serialNo"),
            cell: ({ row }) => {
                const data: string = row.getValue("serialNo");

                return data || "-";
            },
        },
        {
            accessorKey: "bytes",
            header: t("quota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("bytes");

                return data || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "productModel",
            header: t("model"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("productModel");

                return t(data) || "-";
            },
        },
        {
            accessorKey: "endsAt",
            enableGlobalFilter: false,
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("endsAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("endsAt");

                return DateFormat(data);
            },
        },
        {
            accessorKey: "expiresAt",
            enableGlobalFilter: false,
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("expiresAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("expiresAt");

                return DateFormat(data);
            },
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
    ];
    //#endregion

    //#region Data
    useEffect(() => {
        async function getData() {
            const pro: ListBoxItem[] = await getProducts(true);
            setProducts(pro);

            const par: ListBoxItem[] = await getPartners(
                currentUser?.acronisTenantId,
                true,
                true,
            );
            setPartners(par);
        }

        getData();
    }, [currentUser?.acronisTenantId]);
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
                // zebra
                selectable
                columns={columns}
                data={data || []}
                visibleColumns={visibleColumns}
                defaultPageSize={50}
                defaultSort="createdAt"
                defaultSortDirection="desc"
                facetedFilters={[
                    {
                        column: "bytes",
                        title: t("quota"),
                        options: Array.from(
                            new Set(data?.map((item: any) => item.bytes)),
                            (bytes) => ({
                                value: bytes as any,
                                label: bytes as string,
                            }),
                        ),
                    },
                    {
                        column: "productModel",
                        title: t("model"),
                        options: [
                            { value: "perWorkload", label: t("perWorkload") },
                            { value: "perGB", label: t("perGB") },
                        ],
                    },
                    {
                        column: "annual",
                        title: t("annual"),
                        options: [
                            { value: true, label: t("yes") },
                            { value: false, label: t("no") },
                        ],
                    },
                    {
                        column: "freeQuota",
                        title: t("freeQuota"),
                        options: [
                            { value: true, label: t("yes") },
                            { value: false, label: t("no") },
                        ],
                    },
                ]}
                actions={
                    selectedIds.length > 0 && [
                        <DropdownMenuItem
                            key="assign"
                            onClick={() => {
                                setAssignOpen(true);
                            }}
                        >
                            {t("assignToPartner")}
                        </DropdownMenuItem>,
                        <DropdownMenuItem
                            key="print"
                            onClick={async () => {
                                if (selectedIds.length > 25) {
                                    DestructiveToast({
                                        title: t("errorTitle"),
                                        description: t("printLimit"),
                                        t,
                                    });
                                    return;
                                }

                                const zpl: any = await createZPLFromIds(
                                    selectedIds,
                                );

                                createZPLAsPDF(zpl);
                            }}
                        >
                            {t("printAsLabel")}
                        </DropdownMenuItem>,
                        <DropdownMenuItem
                            key="print"
                            onClick={async () => {
                                const licenses = await createLicensePDFFromIds(
                                    selectedIds,
                                );

                                createLicenseAsPDF(licenses);
                            }}
                        >
                            {t("printAsLicense")}
                        </DropdownMenuItem>,
                        <DropdownMenuItem
                            key="delete"
                            onClick={() => setDeleteOpen(true)}
                        >
                            {t("deleteSelected")}
                        </DropdownMenuItem>,
                    ]
                }
                selectOnClick={async (table, row) => {
                    await row.toggleSelected();
                    setSelectedIds(
                        table
                            .getSelectedRowModel()
                            .rows.map((r: any) => r.original?.id),
                    );
                }}
                onSearchEnter={(table, value, setValue) => {
                    const license = data?.find(
                        (d: License) => d.serialNo === value,
                    );
                    if (license) {
                        const selected: any = table
                            .getRowModel()
                            .rows.find(
                                (row: any) => row.original.serialNo === value,
                            );

                        selected.toggleSelected(true);
                        setValue("");
                        setSelectedIds([license.id, ...selectedIds]);
                    }
                }}
                onAddNew={() => {
                    setOpen(true);
                    setSelectedProduct(null);
                    form.reset();
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("addLicense")}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="productId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("product")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="productId"
                                                data={products || []}
                                                form={form}
                                                field={field}
                                                placeholder={t("select")}
                                                inputPlaceholder={t(
                                                    "searchPlaceholder",
                                                )}
                                                emptyText={t("noResults")}
                                                onChange={async () => {
                                                    setSelectedProduct(
                                                        products?.find(
                                                            (p) =>
                                                                p.id ===
                                                                form.getValues(
                                                                    "productId",
                                                                ),
                                                        ),
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.productId
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="piece"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("piece")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.piece
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            {selectedProduct && (
                                <>
                                    {selectedProduct?.freeQuota && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="quota"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            {t("quota")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                            />
                                                        </FormControl>
                                                        <FormError
                                                            error={
                                                                form?.formState
                                                                    ?.errors
                                                                    ?.quota
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
                                                        <FormLabel>
                                                            {t("unit")}
                                                        </FormLabel>
                                                        <Select
                                                            value={
                                                                field.value ??
                                                                undefined
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }
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
                                                                form?.formState
                                                                    ?.errors
                                                                    ?.unit
                                                            }
                                                        />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                    {!selectedProduct?.annual && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="endsAt"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            {t("endsAt")}
                                                        </FormLabel>
                                                        <DatePicker
                                                            field={field}
                                                            from={new Date()}
                                                        />
                                                        <FormError
                                                            error={
                                                                form?.formState
                                                                    ?.errors
                                                                    ?.endsAt
                                                            }
                                                        />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {selectedProduct?.annual && (
                                <FormField
                                    control={form.control}
                                    name="expiresAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("expiresAt")}
                                            </FormLabel>
                                            <DatePicker
                                                field={field}
                                                from={new Date()}
                                            />
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.expiresAt
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="print"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                {t("sendToPrint")}
                                            </FormLabel>
                                            <FormDescription>
                                                {tf("print.description")}
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
                                    {t("add")}
                                    {submitting && (
                                        <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("assignLicense")}</DialogTitle>
                        <DialogDescription>
                            {t("assignToPartnerDescription", {
                                length: selectedIds.length,
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...assignForm}>
                        <form
                            onSubmit={assignForm.handleSubmit(onSubmitAssign)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={assignForm.control}
                                name="partnerAcronisId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("partner")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="partnerAcronisId"
                                                data={partners || []}
                                                form={assignForm}
                                                field={field}
                                                placeholder={t("select")}
                                                inputPlaceholder={t(
                                                    "searchPlaceholder",
                                                )}
                                                emptyText={t("noResults")}
                                            />
                                        </FormControl>
                                        <FormError
                                            error={
                                                assignForm?.formState?.errors
                                                    ?.partnerAcronisId
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
                                    {t("assign")}
                                    {submitting && (
                                        <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteSelected")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteLicenseDescription", {
                                length: selectedIds.length,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="outline">{t("close")}</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={submitting}
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (submitting) return;
                                setSubmitting(true);

                                fetch("/api/admin/license", {
                                    method: "DELETE",
                                    body: JSON.stringify(selectedIds),
                                })
                                    .then((res) => res.json())
                                    .then((res) => {
                                        if (res.ok) {
                                            toast({
                                                description: res.message,
                                            });
                                            setSelectedIds([]);
                                            setDeleteOpen(false);
                                            mutate();
                                        } else {
                                            DestructiveToast({
                                                title: t("errorTitle"),
                                                description: res.message,
                                                t,
                                            });
                                        }
                                    })
                                    .finally(() => setSubmitting(false));
                            }}
                        >
                            {t("delete")}
                            {submitting && (
                                <LuLoaderCircle className="size-4 animate-spin ml-2" />
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
