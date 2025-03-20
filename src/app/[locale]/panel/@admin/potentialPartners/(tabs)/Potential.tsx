"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
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
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";
import Combobox from "@/components/Combobox";

import { LuChevronsUpDown, LuLoaderCircle } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";
import { cities } from "@/lib/constants";

const potentialPartnerFormSchema = z.object({
    status: z.enum(["potential"]),
    companyType: z.enum(["business", "person"]),
    name: z
        .string({
            required_error: "PotentialPartner.name.required",
        })
        .min(3, "PotentialPartner.name.minLength"),
    authorizedPerson: z.string().optional(),
    email: z
        .string()
        .email({
            message: "PotentialPartner.email.invalidType",
        })
        .optional(),
    city: z.coerce.number().optional(),
});

type PotentialPartnerFormValues = z.infer<typeof potentialPartnerFormSchema>;

export default function PotentialTab() {
    const t = useTranslations("General");
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { data, error, isLoading } = useSWR(
        `/api/admin/potentialPartner?status=potential`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Form
    const form = useForm<PotentialPartnerFormValues>({
        resolver: zodResolver(potentialPartnerFormSchema),
        defaultValues: {
            status: "potential",
            companyType: "business",
        },
    });

    function onSubmit(values: PotentialPartnerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch("/api/admin/potentialPartner", {
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
                    router.push("potentialPartners/" + res.data.id);
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
            accessorKey: "authorizedPerson",
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("authorizedPerson")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("authorizedPerson");

                return data || "-";
            },
        },
        {
            accessorKey: "companyType",
            header: t("companyType"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("companyType");

                return data ? t(data) : "-";
            },
        },
        {
            accessorKey: "email",
            header: t("email"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("email");

                return data ? data : "-";
            },
        },
        {
            accessorKey: "city",
            header: t("city"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("city");

                return data ? cities.find((c) => c.code === data)?.name : "-";
            },
            filterFn: (row, id, value) => {
                const city = row.getValue(id) as number;
                const selectedCity = value as string;

                return city === Number(selectedCity);
            },
        },
        {
            accessorKey: "note",
            header: t("note"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("note");

                return (
                    <p>
                        {data
                            ? data.length > 30
                                ? data.substring(0, 30) + "..."
                                : data
                            : "-"}
                    </p>
                );
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
                defaultPageSize={50}
                facetedFilters={[
                    {
                        column: "companyType",
                        title: t("companyType"),
                        options: [
                            {
                                value: "business",
                                label: t("business"),
                            },
                            {
                                value: "person",
                                label: t("person"),
                            },
                        ],
                    },
                    {
                        column: "city",
                        title: t("city"),
                        options: cities.map((city) => ({
                            value: city.code,
                            label: city.name,
                        })),
                    },
                ]}
                onAddNew={() => {
                    setOpen(true);
                    form.reset();
                }}
                onClick={(item) => {
                    router.push("potentialPartners/" + item?.original?.id);
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("newPotentialPartner")}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="companyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("companyType")}
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
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
                                                <SelectItem value="business">
                                                    {t("business")}
                                                </SelectItem>
                                                <SelectItem value="person">
                                                    {t("person")}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.companyType
                                            }
                                        />
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
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("city")}
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                name="city"
                                                data={
                                                    cities.map((c) => {
                                                        return {
                                                            id: c.code,
                                                            name: c.name,
                                                        };
                                                    }) || []
                                                }
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
                                                form?.formState?.errors?.city
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="authorizedPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("authorizedPerson")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.authorizedPerson
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("email")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.email
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
