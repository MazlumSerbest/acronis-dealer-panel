import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogDescription,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";

import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown, LuMinus, LuMoreHorizontal } from "react-icons/lu";
import useUserStore from "@/store/user";
import { cn } from "@/lib/utils";
import { getCustomers } from "@/lib/data";
import Combobox from "@/components/Combobox";

const addFormSchema = z.object({
    partnerId: z.string().cuid().optional(),
    serials: z.array(
        z.object({
            value: z.string().length(10, {
                message: "Lütfen geçerli bir lisans kodu giriniz.",
            }),
        }),
    ),
});

type AddFormValues = z.infer<typeof addFormSchema>;

const defaultValues: Partial<AddFormValues> = {
    serials: [{ value: "" }],
};

const assignFormSchema = z.object({
    customerId: z.string().cuid(),
});

type AssignFormValues = z.infer<typeof assignFormSchema>;

export default function InactiveTab() {
    const t = useTranslations("General");
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    // const [selected, setSelected] = useState();
    const [customers, setCustomers] = useState<ListBoxItem[] | null>(null);

    const [openAdd, setOpenAdd] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);

    const { data, error, mutate } = useSWR(
        `/api/license?partnerId=${currentUser?.partnerId}&status=inactive`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    // #region Form
    const addForm = useForm<AddFormValues>({
        resolver: zodResolver(addFormSchema),
        defaultValues,
        // mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        name: "serials",
        control: addForm.control,
    });

    function onSubmitAdd(values: AddFormValues) {
        values.partnerId = currentUser?.partnerId;
        if (!values.partnerId) return;

        fetch("/api/license", {
            method: "PUT",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpenAdd(false);
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
        fetch("/api/license/assign", {
            method: "PUT",
            body: JSON.stringify({
                ...values,
                ids: selectedIds,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpenAssign(false);
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
        expiresAt: false,
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
            accessorKey: "assignedAt",
            header: t("assignedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("assignedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "expiresAt",
            header: t("expiresAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("expiresAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "product",
            header: t("quota"),
            cell: ({ row }) => {
                const data: Product = row.getValue("product");

                return data?.quota || "-";
            },
        },
        {
            accessorKey: "product",
            header: t("unit"),
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
        // {
        //     accessorKey: "actions",
        //     header: "",
        //     enableGlobalFilter: false,
        //     enableHiding: false,
        //     cell: ({ row }) => {
        //         const data: User = row.original;

        //         return (
        //             <DropdownMenu>
        //                 <DropdownMenuTrigger className="flex items-center">
        //                     <LuMoreHorizontal className="size-4" />
        //                     {/* <Button
        //                         aria-haspopup="true"
        //                         size="icon"
        //                         variant="ghost"
        //                     >
        //                         <LuMoreHorizontal className="size-4" />
        //                         <span className="sr-only">
        //                             {t("toggleMenu")}
        //                         </span>
        //                     </Button> */}
        //                 </DropdownMenuTrigger>
        //                 <DropdownMenuContent align="end">
        //                     <DropdownMenuLabel>
        //                         {t("actions")}
        //                     </DropdownMenuLabel>
        //                     <DropdownMenuItem
        //                         onClick={() => {
        //                             // setIsNew(false);
        //                             // setOpen(true);
        //                             // form.reset(data);
        //                         }}
        //                     >
        //                         {t("assignToCustomer")}
        //                     </DropdownMenuItem>
        //                 </DropdownMenuContent>
        //             </DropdownMenu>
        //         );
        //     },
        // },
    ];
    //#endregion

    //#region Data
    useEffect(() => {
        async function getData() {
            const cus: ListBoxItem[] = await getCustomers(
                currentUser?.partnerId,
                true,
            );
            setCustomers(cus);
        }

        getData();
    }, [currentUser?.partnerId]);
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
                zebra
                columns={columns}
                data={data || []}
                visibleColumns={visibleColumns}
                actions={
                    selectedIds.length > 0 && [
                        <DropdownMenuItem
                            key="assign"
                            onClick={() => {
                                setOpenAssign(true);
                                assignForm.reset();
                            }}
                        >
                            {t("assignToCustomer")}
                        </DropdownMenuItem>,
                    ]
                }
                selectOnClick={async (table, row) => {
                    await row.toggleSelected();
                    await setSelectedIds(
                        table
                            .getSelectedRowModel()
                            .rows.map((r: any) => r.original?.id),
                    );
                }}
                onAddNew={() => {
                    setOpenAdd(true);
                    addForm.reset();
                }}
            />

            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("addLicense")}</DialogTitle>
                    </DialogHeader>

                    <Form {...addForm}>
                        <form
                            onSubmit={addForm.handleSubmit(onSubmitAdd)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <div>
                                {fields.map((field, index) => (
                                    <FormField
                                        control={addForm.control}
                                        key={field.id}
                                        name={`serials.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={cn(
                                                        index !== 0 &&
                                                            "sr-only",
                                                    )}
                                                >
                                                    {t("licenseSerialNo")}
                                                </FormLabel>
                                                <FormDescription
                                                    className={cn(
                                                        index !== 0 &&
                                                            "sr-only",
                                                    )}
                                                >
                                                    {t("addLicenseDescription")}
                                                </FormDescription>
                                                <FormControl>
                                                    <div className="flex flex-row gap-2">
                                                        <Input {...field} />
                                                        {index !== 0 && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    remove(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <LuMinus className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => append({ value: "" })}
                                >
                                    {t("addSerialNo")}
                                </Button>
                            </div>
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

            <Dialog open={openAssign} onOpenChange={setOpenAssign}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("assignLicense")}</DialogTitle>
                    </DialogHeader>

                    <Form {...assignForm}>
                        <form
                            onSubmit={assignForm.handleSubmit(onSubmitAssign)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={assignForm.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("customer")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="customerId"
                                                data={customers || []}
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
                                                    ?.customerId
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
