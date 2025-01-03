import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import Combobox from "@/components/Combobox";
import FormError from "@/components/FormError";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown, LuLoader2 } from "react-icons/lu";
import { getPartners, getProducts } from "@/lib/data";
import useUserStore from "@/store/user";

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
    expiresAt: z.date().optional(),
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
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();

    const [open, setOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [products, setProducts] = useState<ListBoxItem[] | null>(null);
    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data, error, mutate } = useSWR(
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
            piece: 100,
            expiresAt: new Date(
                new Date().setFullYear(new Date().getFullYear() + 2),
            ),
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
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });

                    // ZPL Export
                    const labels = res.data.map((obj: any) => {
                        return `^XA
^CF0,20
^FO30,20^FD${products?.find((p) => p.id === obj.productId)?.name}^FS
^FO320,20^FDExp: ${DateFormat(obj.expiresAt).replaceAll(".", "/")}^FS
^BY2,2,40
^FO30,45^BC^FD${obj.serialNo}^FS
^XZ

^XA
^CF0,15
^FO165,10^FDS/N: ${obj.serialNo}^FS
^BY2,2,40
^FO50,28^BC,60^FD${obj.key}^FS
^XZ`;
                    });
                    const zplContent = labels.join("\n\n");

                    const blob = new Blob([zplContent], {
                        type: "text/zpl;charset=utf-8;",
                    });

                    const zplLink = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    zplLink.setAttribute("href", url);
                    zplLink.setAttribute(
                        "download",
                        `${
                            products?.find((p) => p.id === values.productId)
                                ?.name
                        } Labels - ${DateTimeFormat(
                            new Date().toISOString(),
                        )}.zpl`,
                    );
                    document.body.appendChild(zplLink);
                    zplLink.click();
                    document.body.removeChild(zplLink);

                    setOpen(false);
                    form.reset();
                    mutate();
                } else {
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }

                setSubmitting(false);
            });
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
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }

                setSubmitting(false);
            });
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
            accessorKey: "productQuota",
            header: t("quota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("productQuota");
                const unit: string = row.original.productUnit;

                return `${data} ${unit === "GB" ? unit : ""}`;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "expiresAt",
            enableGlobalFilter: false,
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("expiresAt")}
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
                const data: string = row.getValue("expiresAt");

                return DateFormat(data);
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
    if (!data)
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
                        column: "productQuota",
                        title: t("quota"),
                        options: [
                            { value: 1, label: "1" },
                            { value: 25, label: "25GB" },
                            { value: 50, label: "50GB" },
                            { value: 100, label: "100GB" },
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

                            <FormField
                                control={form.control}
                                name="expiresAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("expiresAt")}</FormLabel>
                                        <DatePicker field={field} />
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.expiresAt
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
                                    {t("add")}
                                    {submitting && (
                                        <LuLoader2 className="size-4 animate-spin ml-2" />
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
                                        <LuLoader2 className="size-4 animate-spin ml-2" />
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
