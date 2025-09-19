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
import { LicenseHistorySheet } from "@/components/LicenseHistorySheet";
import DestructiveToast from "@/components/DestructiveToast";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";
import Combobox from "@/components/Combobox";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import { createLicensePDFFromIds, createZPLFromIds } from "@/utils/documents";
import { createLicenseAsPDF, createZPLAsPDF } from "@/utils/pdf";
import { LuChevronsUpDown, LuHistory, LuLoaderCircle } from "react-icons/lu";
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

const assignToSubPartnerFormSchema = z.object({
    partnerAcronisId: z
        .string({
            required_error: "License.partnerAcronisId.required",
        })
        .uuid(),
});

type AssignToSubPartnerFormValues = z.infer<
    typeof assignToSubPartnerFormSchema
>;

export default function AssignedTab() {
    const t = useTranslations("General");

    const [customers, setCustomers] = useState<ListBoxItem[] | null>(null);
    const [subPartners, setSubPartners] = useState<ListBoxItem[] | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openAssignToCustomer, setOpenAssignToCustomer] = useState(false);
    const [openAssignToSubPartner, setOpenAssignToSubPartner] = useState(false);
    const [fromPartner, setFromPartner] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/license?status=assigned`,
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
            `/api/license/assign?kind=customer&from=${fromPartner?.acronisId}`,
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
                    DestructiveToast({
                        title: t("errorTitle"),
                        description: res.message,
                        t,
                    });
                }
            })
            .finally(() => setSubmitting(false));
    }

    const assignToSubPartnerForm = useForm<AssignToSubPartnerFormValues>({
        resolver: zodResolver(assignToSubPartnerFormSchema),
    });

    function onSubmitAssignToSubPartner(values: AssignToSubPartnerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(
            `/api/license/assign?kind=partner&from=${fromPartner?.acronisId}`,
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
                    setOpenAssignToSubPartner(false);
                    assignToSubPartnerForm.reset();
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
            accessorKey: "partnerName",
            header: t("partnerName"),
            cell: ({ row }) => {
                const data: string = row.getValue("partnerName");

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
            accessorKey: "assignedAt",
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
                    {t("assignedAt")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("assignedAt");

                return DateTimeFormat(data);
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
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div
                    className="flex flex-row gap-2"
                    onClick={(event) => event.stopPropagation()}
                >
                    <LicenseHistorySheet
                        licenseId={row.original.id}
                        trigger={
                            <LuHistory className="size-4 text-muted-foreground cursor-pointer hover:text-blue-400 active:text-blue-400/60" />
                        }
                    />
                </div>
            ),
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
                selectable
                columns={columns}
                data={data || []}
                visibleColumns={visibleColumns}
                defaultSort="expiresAt"
                defaultSortDirection="asc"
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
                        selectedIds.length === 1 && (
                            <DropdownMenuItem
                                key="assignToCustomer"
                                onClick={async () => {
                                    const lic = data.find(
                                        (item: any) =>
                                            item.id === selectedIds[0],
                                    );

                                    const customers = await getCustomers(
                                        lic?.partnerAcronisId,
                                        true,
                                    );

                                    setCustomers(customers);
                                    setFromPartner({
                                        acronisId: lic?.partnerAcronisId,
                                        name: lic?.partnerName,
                                    });
                                    assignToCustomerForm.reset();
                                    setOpenAssignToCustomer(true);
                                }}
                            >
                                {t("assignToCustomer")}
                            </DropdownMenuItem>
                        ),
                        <DropdownMenuItem
                            key="assignToSubPartner"
                            onClick={async () => {
                                const lic = data.find(
                                    (item: any) => item.id === selectedIds[0],
                                );

                                if (
                                    selectedIds.length > 1 &&
                                    selectedIds.some(
                                        (id: string) =>
                                            data.find(
                                                (item: any) => item.id === id,
                                            )?.partnerAcronisId !==
                                            lic?.partnerAcronisId,
                                    )
                                ) {
                                    DestructiveToast({
                                        title: t("errorTitle"),
                                        description: t(
                                            "canNotAssignDifferentPartnersLicenses",
                                        ),
                                        t,
                                    });
                                    return;
                                }

                                const partners = await getPartners(
                                    lic?.partnerAcronisId,
                                    true,
                                );

                                setSubPartners(partners);
                                setFromPartner({
                                    acronisId: lic?.partnerAcronisId,
                                    name: lic?.partnerName,
                                });
                                assignToSubPartnerForm.reset();
                                setOpenAssignToSubPartner(true);
                            }}
                        >
                            {t("assignToSubPartner")}
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
                            {t("printSelected")}
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
            />

            <Dialog
                open={openAssignToCustomer}
                onOpenChange={setOpenAssignToCustomer}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("assignToCustomer")} ({fromPartner?.name})
                        </DialogTitle>
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
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                        .replace(
                                                            /[^A-Za-z0-9]/g,
                                                            "",
                                                        )
                                                        .toUpperCase()
                                                        .replace(
                                                            /(.{4})(?=.)/g,
                                                            "$1-",
                                                        )
                                                        .slice(0, 14);

                                                    assignToCustomerForm.setValue(
                                                        "key",
                                                        value,
                                                    );
                                                }}
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
                                        <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={openAssignToSubPartner}
                onOpenChange={setOpenAssignToSubPartner}
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

                    <Form {...assignToSubPartnerForm}>
                        <form
                            onSubmit={assignToSubPartnerForm.handleSubmit(
                                onSubmitAssignToSubPartner,
                            )}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={assignToSubPartnerForm.control}
                                name="partnerAcronisId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("partner")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="partnerAcronisId"
                                                data={subPartners || []}
                                                form={assignToSubPartnerForm}
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
                                                assignToSubPartnerForm
                                                    ?.formState?.errors
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
        </>
    );
}
