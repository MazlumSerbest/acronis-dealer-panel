"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

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
import { ColumnDef, Row } from "@tanstack/react-table";
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

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import Combobox from "@/components/Combobox";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";
import { LuChevronsUpDown, LuMoreHorizontal } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";
import { getPartners } from "@/lib/data";
import useUserStore from "@/store/user";

const userFormSchema = z.object({
    id: z.string().cuid().optional(),
    active: z.boolean(),
    licensed: z.boolean(),
    role: z.enum(["admin", "partner"], {
        required_error: "User.role.required",
    }),
    name: z.string({
        required_error: "User.name.required",
    }),
    email: z
        .string({
            required_error: "User.email.required",
        })
        .email({
            message: "User.email.invalidType",
        }),
    partnerAcronisId: z.string().optional().nullable(),
    tenantAcronisId: z.string().optional().nullable(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.User");
    const { user: currentUser } = useUserStore();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);

    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);

    const { data, error, isLoading, mutate } = useSWR(`/api/admin/user`, null, {
        revalidateOnFocus: false,
    });

    //#region Form
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            active: true,
            licensed: false,
        },
    });

    function onSubmit(values: UserFormValues) {
        if (isNew) {
            if(values.role === "admin")
                values.tenantAcronisId = "15229d4a-ff0f-498b-849d-a4f71bdc81a4";

            fetch("/api/admin/user", {
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
                        form.reset();
                    } else {
                        toast({
                            variant: "destructive",
                            title: t("errorTitle"),
                            description: res.message,
                        });
                    }
                });
        } else {
            fetch(`/api/admin/user/${values.id}`, {
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
                    } else {
                        toast({
                            variant: "destructive",
                            title: t("errorTitle"),
                            description: res.message,
                        });
                    }
                });
        }
    }
    //#endregion

    //#region Table
    const visibleColumns = {
        acronisTenantId: false,
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
                const data: string = row.getValue("name");

                return data || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "email",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("email")}
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
                const data: string = row.getValue("email");

                return data || "-";
            },
        },
        {
            accessorKey: "role",
            header: t("role"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("role");

                return t(data) || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "partner",
            header: t("partnerName"),
            cell: ({ row }) => {
                const data: Partner = row.getValue("partner");

                return data?.name || "-";
            },
            filterFn: (rows: any, id, value) => {
                return rows?.filter((row: any) => {
                    const partner = row.getValue("name");

                    return partner.name
                        .toLowerCase()
                        .includes(value.toLowerCase());
                });
            },
        },
        // {
        //     accessorKey: "acronisTenantId",
        //     header: t("acronisTenantId"),
        //     enableGlobalFilter: false,
        // },
        {
            accessorKey: "emailVerified",
            header: t("emailVerified"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("emailVerified");

                const emailVerified: boolean = data?.length > 0;
                return <BoolChip size="size-4" value={emailVerified} />;
            },
        },
        {
            accessorKey: "licensed",
            header: t("licensedUser"),
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
                const data: User = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuMoreHorizontal className="size-4" />
                            {/* <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                            >
                                <LuMoreHorizontal className="size-4" />
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
                            <DropdownMenuItem>{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    //#endregion

    //#region Data

    useEffect(() => {
        async function getData() {
            const par: ListBoxItem[] = await getPartners(
                undefined,
                true,
            );
            setPartners(par);
        }
        
        getData();
    }, [currentUser?.acronisTenantId]);
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
                data={data}
                visibleColumns={visibleColumns}
                isLoading={isLoading}
                facetedFilters={[
                    {
                        column: "role",
                        title: t("role"),
                        options: [
                            { value: "admin", label: t("admin") },
                            { value: "partner", label: t("partner") },
                        ],
                    },
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
                ]}
                onAddNew={() => {
                    setIsNew(true);
                    setOpen(true);
                    form.reset();
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew
                                ? `${t("new")} ${t("user")}`
                                : `${t("edit")} ${t("user")}`}
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
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("role")}
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
                                                <SelectItem value="admin">
                                                    {t("admin")}
                                                </SelectItem>
                                                <SelectItem value="partner">
                                                    {t("partner")}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.role
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("email")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.email
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            {form.watch("role") === "partner" && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="licensed"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel>
                                                        {t("licensedUser")}
                                                    </FormLabel>
                                                    <FormDescription>
                                                        {tf(
                                                            "licensed.description",
                                                        )}
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

                                    <FormField
                                        control={form.control}
                                        name="partnerAcronisId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("partner")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        name="partnerAcronisId"
                                                        data={partners || []}
                                                        form={form}
                                                        field={field}
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                        inputPlaceholder={t(
                                                            "searchPlaceholder",
                                                        )}
                                                        emptyText={t(
                                                            "noResults",
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.partnerAcronisId
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

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
                                    {t("save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
