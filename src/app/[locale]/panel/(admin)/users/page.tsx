"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { set, useForm } from "react-hook-form";
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
    FormMessage,
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

import DataTable from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import Combobox from "@/components/Combobox";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LuChevronsUpDown, LuMoreHorizontal } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";
import { getPartners } from "@/lib/data";

const userFormSchema = z.object({
    id: z.string().optional(),
    active: z.boolean(),
    role: z.enum(["admin", "partner"]),
    name: z.string(),
    email: z.string().email(),
    partnerId: z.string().optional().nullable(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.User");
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);

    const [partners, setPartners] = useState<ListBoxItem[] | null>(null);

    const { data, error, isLoading, mutate } = useSWR(`/api/user`, null, {
        revalidateOnFocus: false,
    });

    //#region Form
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
    });

    function onSubmit(values: UserFormValues) {
        if (isNew) {
            fetch("/api/user", {
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
        } else {
            fetch(`/api/user/${values.id}`, {
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
        },
        {
            accessorKey: "partner",
            header: t("partnerName"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: Partner = row.getValue("partner");

                return data?.application?.name || "-";
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
                return <BoolChip value={emailVerified} />;
            },
        },
        {
            accessorKey: "active",
            header: t("active"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("active");

                return <BoolChip value={data} />;
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
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: User = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
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
    async function getData() {
        const par: ListBoxItem[] = await getPartners(true);
        setPartners(par);
    }

    useEffect(() => {
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
                zebra
                columns={columns}
                data={data}
                visibleColumns={visibleColumns}
                isLoading={isLoading}
                onAddNew={() => {
                    setIsNew(true);
                    setOpen(true);
                    form.reset({ active: true });
                    form.reset({ active: true });
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
                                        <FormMessage />
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
                                        <FormMessage />
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.watch("role") === "partner" && (
                                <FormField
                                    control={form.control}
                                    name="partnerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("partner")}
                                            </FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    name="partnerId"
                                                    data={partners || []}
                                                    form={form}
                                                    field={field}
                                                    placeholder={t("select")}
                                                    inputPlaceholder={t(
                                                        "searchPlaceholder",
                                                    )}
                                                    emptyText={t("noResults")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
