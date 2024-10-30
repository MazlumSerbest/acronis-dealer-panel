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

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import Combobox from "@/components/Combobox";
import FormError from "@/components/FormError";
import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";
import { getPartners, getProducts } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const licenseFormSchema = z.object({
    productId: z.string(),
    serialNo: z.string(),
    key: z.string(),
    expiresAt: z.date().optional(),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;

const assignFormSchema = z.object({
    partnerId: z.string().cuid(),
});

type AssignFormValues = z.infer<typeof assignFormSchema>;

export default function UnassignedTab() {
    const t = useTranslations("General");
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [products, setProducts] = useState<ListBoxItem[] | null>(null);
    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data, error, mutate } = useSWR(
        `/api/admin/license?status=unassigned`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                console.log(data);
            },
        },
    );

    // #region Form
    const form = useForm<LicenseFormValues>({
        resolver: zodResolver(licenseFormSchema),
    });

    function onSubmit(values: LicenseFormValues) {
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
                    setOpen(false);
                    mutate();
                } else {
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }
            });
    }

    const assignForm = useForm<AssignFormValues>({
        resolver: zodResolver(assignFormSchema),
    });

    function onSubmitAssign(values: AssignFormValues) {
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
                    setAssignOpen(false);
                    mutate();
                } else {
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }
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
            accessorKey: "product",
            enableHiding: false,
            accessorFn: (row) => row.original.product.name,
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
                const data: Product = row.getValue("product");

                return data?.name || "-";
            },
            filterFn: (row, columnId, filterValue) => {
                const product: Product = row.getValue("product");

                return product.name
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
            },
        },
        {
            accessorKey: "serialNo",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("serialNo")}
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
                const data: string = row.getValue("serialNo");

                return data || "-";
            },
        },
        {
            accessorKey: "product",
            header: t("quota"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: Product = row.getValue("product");

                return data?.quota || "-";
            },
        },
        {
            accessorKey: "product",
            header: t("unit"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: Product = row.getValue("product");

                return t(data?.unit) || "-";
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
            const par: ListBoxItem[] = await getPartners(true);
            setPartners(par);
        }

        getData();
    }, []);
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
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
                columns={columns}
                data={data || []}
                visibleColumns={visibleColumns}
                selectable
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
                onAddNew={() => {
                    setOpen(true);
                    form.reset();
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {`${t("add")} ${t("license")}`}
                        </DialogTitle>
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
                                name="serialNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("serialNo")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.serialNo
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("key")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={form?.formState?.errors?.key}
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expiresAt"
                                render={({ field }) => (
                                    <FormItem className="">
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
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-600/90"
                                >
                                    {t("add")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("assign")} {t("license")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("assignDescription", {
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
                                name="partnerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("partner")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="partnerId"
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
                                                    ?.partnerId
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
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-600/90"
                                >
                                    {t("assign")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
