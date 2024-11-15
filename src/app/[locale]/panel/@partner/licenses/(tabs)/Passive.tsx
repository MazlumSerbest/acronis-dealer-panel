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

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown, LuMinus, LuMoreHorizontal } from "react-icons/lu";
import useUserStore from "@/store/user";
import { cn } from "@/lib/utils";
import { getCustomers, getPartners } from "@/lib/data";
import Combobox from "@/components/Combobox";

const addFormSchema = z.object({
    partnerAcronisId: z.string().uuid().optional(),
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

const assignToCustomerFormSchema = z.object({
    customerAcronisId: z.string().uuid(),
});

type AssignToCustomerFormValues = z.infer<typeof assignToCustomerFormSchema>;

const assignToPartnerFormSchema = z.object({
    partnerAcronisId: z.string().uuid(),
});

type AssignToPartnerFormValues = z.infer<typeof assignToPartnerFormSchema>;

export default function PassiveTab() {
    const t = useTranslations("General");
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();

    const [customers, setCustomers] = useState<ListBoxItem[] | null>(null);
    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openAssignToCustomer, setOpenAssignToCustomer] = useState(false);
    const [openAssignToPartner, setOpenAssignToPartner] = useState(false);

    const { data, error, mutate } = useSWR(
        `/api/license?partnerAcronisId=${currentUser?.partnerAcronisId}&status=inactive`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    // #region Form
    const addForm = useForm<AddFormValues>({
        resolver: zodResolver(addFormSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        name: "serials",
        control: addForm.control,
    });

    function onSubmitAdd(values: AddFormValues) {
        values.partnerAcronisId = currentUser?.partnerAcronisId;
        if (!values.partnerAcronisId) return;

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

    const assignToCustomerForm = useForm<AssignToCustomerFormValues>({
        resolver: zodResolver(assignToCustomerFormSchema),
    });

    function onSubmitAssignToCustomer(values: AssignToCustomerFormValues) {
        fetch(`/api/license/assign?kind=customer&from=${currentUser?.partnerAcronisId}`, {
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
                    setOpenAssignToCustomer(false);
                    assignToCustomerForm.reset();
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

    const assignToPartnerForm = useForm<AssignToPartnerFormValues>({
        resolver: zodResolver(assignToPartnerFormSchema),
    });

    function onSubmitAssignToPartner(values: AssignToPartnerFormValues) {
        fetch(`/api/license/assign?kind=partner&from=${currentUser?.partnerAcronisId}`, {
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
                    setOpenAssignToPartner(false);
                    assignToPartnerForm.reset();
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

                return `${data} ${unit || ""}` || "-";
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
            const cus: ListBoxItem[] = await getCustomers(
                currentUser?.partnerAcronisId,
                true,
            );
            setCustomers(cus);

            const par: ListBoxItem[] = await getPartners(
                currentUser?.partnerAcronisId,
                true,
            );
            setPartners(par);
        }

        getData();
    }, [currentUser?.partnerAcronisId]);
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
                selectable
                columns={columns}
                data={data || []}
                visibleColumns={visibleColumns}
                defaultSort="expiresAt"
                defaultSortDirection="desc"
                facetedFilters={[
                    {
                        column: "productQuota",
                        title: t("quota"),
                        options: [
                            { value: 25, label: "25GB" },
                            { value: 50, label: "50GB" },
                            { value: 100, label: "100GB" },
                        ],
                    },
                ]}
                actions={
                    selectedIds.length > 0 && [
                        <DropdownMenuItem
                            key="assignToCustomer"
                            onClick={() => {
                                setOpenAssignToCustomer(true);
                                assignToCustomerForm.reset();
                            }}
                        >
                            {t("assignSelectedToCustomer")}
                        </DropdownMenuItem>,
                        partners && partners?.length > 0 && (
                            <DropdownMenuItem
                                key="assignToPartner"
                                onClick={() => {
                                    setOpenAssignToPartner(true);
                                    assignToPartnerForm.reset();
                                }}
                            >
                                {t("assignSelectedToPartner")}
                            </DropdownMenuItem>
                        ),
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
                // onAddNew={() => {
                //     setOpenAdd(true);
                //     addForm.reset();
                // }}
            />

            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("addLicense")}</DialogTitle>
                    </DialogHeader>

                    <Form {...addForm}>
                        <form
                            onSubmit={addForm.handleSubmit(onSubmitAdd)}
                            autoComplete="off"
                            className="space-y-4"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    append({ value: "" });
                                    // Focus the newly added input after a short delay to allow render
                                    setTimeout(() => {
                                        const inputs =
                                            document.querySelectorAll(
                                                'input[name^="serials"]',
                                            );
                                        const lastInput = inputs[
                                            inputs.length - 1
                                        ] as HTMLInputElement;
                                        lastInput?.focus();
                                    }, 0);
                                }
                            }}
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

            <Dialog
                open={openAssignToCustomer}
                onOpenChange={setOpenAssignToCustomer}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("assignToCustomer")}</DialogTitle>
                        {customers?.length === 0 ? (
                            <DialogDescription className="text-destructive">
                                {t("assignToCustomerError")}
                            </DialogDescription>
                        ) : (
                            <DialogDescription>
                                {t("assignToCustomerDescription", {
                                    length: selectedIds.length,
                                })}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <Form {...assignToCustomerForm}>
                        <form
                            onSubmit={assignToCustomerForm.handleSubmit(
                                onSubmitAssignToCustomer,
                            )}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={assignToCustomerForm.control}
                                name="customerAcronisId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("customer")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="customerAcronisId"
                                                data={customers || []}
                                                form={assignToCustomerForm}
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
                                                assignToCustomerForm?.formState
                                                    ?.errors?.customerAcronisId
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

            <Dialog
                open={openAssignToPartner}
                onOpenChange={setOpenAssignToPartner}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("assignToPartner")}</DialogTitle>
                        <DialogDescription>
                            {t("assignToPartnerDescription", {
                                length: selectedIds.length,
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...assignToCustomerForm}>
                        <form
                            onSubmit={assignToPartnerForm.handleSubmit(
                                onSubmitAssignToPartner,
                            )}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={assignToPartnerForm.control}
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
                                                form={assignToPartnerForm}
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
                                                assignToPartnerForm?.formState
                                                    ?.errors?.partnerAcronisId
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
