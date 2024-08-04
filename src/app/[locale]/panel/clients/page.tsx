"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import DataTable from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";
import PageHeader from "@/components/PageHeader";
import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown } from "react-icons/lu";
import useUserStore from "@/store/user";
import { Input } from "@/components/ui/input";

const clientFormSchema = z.object({
    name: z
        .string({
            required_error: "Client.name.required",
        })
        .min(6, {
            message: "Client.name.minLength",
        }),
    login: z
        .string({
            required_error: "Client.login.required",
        })
        .min(6, {
            message: "Client.login.minLength",
        }),
    email: z
        .string({
            required_error: "Client.email.required",
        })
        .email({
            message: "Client.email.invalidType",
        }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function ClientsPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();
    const [open, setOpen] = useState(false);
    const [loginAlreadyTaken, setLoginAlreadyTaken] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/acronis/tenants/children/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Form
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
    });

    async function onSubmit(values: ClientFormValues) {
        const client = {
            name: values.name,
            login: values.login,
            parent_id: currentUser?.acronisTenantId,
            contact: {
                email: values.email,
            }
        };

        await fetch("/api/acronis/tenants", {
            method: "POST",
            body: JSON.stringify(client, null, 4),
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
    //#endregion

    //#region Table
    const visibleColumns = { created_at: false, updated_at: false };

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

                return <div className="font-medium">{data || "-"}</div>;
            },
        },
        {
            accessorKey: "kind",
            header: t("kind"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("kind");

                return data
                    ? data == "partner"
                        ? t("partner")
                        : t("customer")
                    : "-";
            },
        },
        {
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return <BoolChip size="size-4" value={data == "enabled"} />;
            },
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip size="size-4" value={data} />;
            },
        },
        {
            accessorKey: "usage",
            header: t("usage"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("usage");

                return data || "-";
            },
        },
        {
            accessorKey: "created_at",
            header: t("createdAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("created_at");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "updated_at",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updated_at");

                return DateTimeFormat(data);
            },
        },
    ];
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("clients")} />
            {!data ? (
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            ) : (
                <>
                    <DataTable
                        zebra
                        data={data?.children?.items || []}
                        columns={columns}
                        visibleColumns={visibleColumns}
                        defaultPageSize={50}
                        isLoading={isLoading}
                        onAddNew={() => {
                            setOpen(true);
                        }}
                        onClick={(item) => {
                            router.push("clients/" + item?.original?.id);
                        }}
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {`${t("new")} ${t("client")}`}
                                </DialogTitle>
                                <DialogDescription></DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    autoComplete="off"
                                    className="space-y-4"
                                >
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
                                                        form?.formState?.errors
                                                            ?.name
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="login"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                    {t("username")}
                                                </FormLabel>
                                                <FormDescription>
                                                    This will be used to login
                                                    to Acronis Cloud Console and
                                                    must be unique.
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        onChange={(v) => {
                                                            form.setValue(
                                                                "login",
                                                                v.target.value,
                                                            );
                                                            if (
                                                                v.target.value
                                                                    .length > 5
                                                            )
                                                                fetch(
                                                                    `/api/acronis/users/checkLogin?username=${v.target.value}`,
                                                                )
                                                                    .then(
                                                                        (res) =>
                                                                            res.json(),
                                                                    )
                                                                    .then(
                                                                        (
                                                                            res,
                                                                        ) => {
                                                                            if (
                                                                                res.ok
                                                                            ) {
                                                                                setLoginAlreadyTaken(
                                                                                    false,
                                                                                );
                                                                                form.clearErrors(
                                                                                    "login",
                                                                                );
                                                                            } else {
                                                                                setLoginAlreadyTaken(
                                                                                    true,
                                                                                );
                                                                                form.setError(
                                                                                    "login",
                                                                                    {
                                                                                        type: "manual",
                                                                                        message:
                                                                                            "Client.login.alreadyTaken",
                                                                                    },
                                                                                );
                                                                            }
                                                                        },
                                                                    );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.login
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
                                                        form?.formState?.errors
                                                            ?.email
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
                                            disabled={loginAlreadyTaken}
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
            )}
        </div>
    );
}
