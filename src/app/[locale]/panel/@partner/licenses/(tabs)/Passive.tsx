import { useEffect, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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

import { DataTable } from "@/components/table/DataTable";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";
import Combobox from "@/components/Combobox";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown, LuLoader2, LuMinus } from "react-icons/lu";
import useUserStore from "@/store/user";
import { getCustomers, getPartners } from "@/lib/data";

const assignToCustomerFormSchema = z.object({
    customerAcronisId: z
        .string({
            required_error: "License.customerAcronisId.required",
        })
        .uuid(),
    key: z
        .string({
            required_error: "License.key.required",
        })
        .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "License.key.regex"),
});

type AssignToCustomerFormValues = z.infer<typeof assignToCustomerFormSchema>;

const assignToPartnerFormSchema = z.object({
    partnerAcronisId: z
        .string({
            required_error: "License.partnerAcronisId.required",
        })
        .uuid(),
});

type AssignToPartnerFormValues = z.infer<typeof assignToPartnerFormSchema>;

export default function PassiveTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const [customers, setCustomers] = useState<ListBoxItem[] | null>(null);
    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openAssignToCustomer, setOpenAssignToCustomer] = useState(false);
    const [openAssignToPartner, setOpenAssignToPartner] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/license?status=inactive&partnerAcronisId=${currentUser?.partnerAcronisId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    // #region Form
    const assignToCustomerForm = useForm<AssignToCustomerFormValues>({
        resolver: zodResolver(assignToCustomerFormSchema),
    });

    function onSubmitAssignToCustomer(values: AssignToCustomerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(
            `/api/license/assign?kind=customer&from=${currentUser?.partnerAcronisId}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    ...values,
                    ids: selectedIds,
                }),
            },
        )
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setSelectedIds([]);
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
                setSubmitting(false);
            });
    }

    const assignToPartnerForm = useForm<AssignToPartnerFormValues>({
        resolver: zodResolver(assignToPartnerFormSchema),
    });

    function onSubmitAssignToPartner(values: AssignToPartnerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(
            `/api/license/assign?kind=partner&from=${currentUser?.partnerAcronisId}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    ...values,
                    ids: selectedIds,
                }),
            },
        )
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setSelectedIds([]);
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
            accessorKey: "productModel",
            header: t("model"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("productModel");

                return t(data) || "-";
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
                true,
            );
            setPartners(par);
        }

        getData();
    }, [currentUser?.partnerAcronisId]);
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
                defaultSort="expiresAt"
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
                    {
                        column: "productModel",
                        title: t("model"),
                        options: [
                            { value: "perWorkload", label: t("perWorkload") },
                            { value: "perGB", label: t("perGB") },
                        ],
                    },
                ]}
                actions={
                    selectedIds.length > 0 && [
                        <DropdownMenuItem
                            key="assignToCustomer"
                            onClick={() => {
                                if (selectedIds.length === 1) {
                                    setOpenAssignToCustomer(true);
                                    assignToCustomerForm.reset();
                                } else {
                                    toast({
                                        variant: "destructive",
                                        title: t("errorTitle"),
                                        description: t(
                                            "moreThanOneLicenseError",
                                        ),
                                    });
                                }
                            }}
                        >
                            {t("assignToCustomer")}
                        </DropdownMenuItem>,
                        partners && partners?.length > 0 && (
                            <DropdownMenuItem
                                key="assignToPartner"
                                onClick={() => {
                                    setOpenAssignToPartner(true);
                                    assignToPartnerForm.reset();
                                }}
                            >
                                {t("assignToPartner")}
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
            />

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
                            {/* <FormField

                            /> */}

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

                            <FormField
                                control={assignToCustomerForm.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("licenseKey")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) =>
                                                    assignToCustomerForm.setValue(
                                                        "key",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="A1B2-C3D4-E5F6"
                                            />
                                        </FormControl>
                                        <FormError
                                            error={
                                                assignToCustomerForm?.formState
                                                    ?.errors?.key
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
