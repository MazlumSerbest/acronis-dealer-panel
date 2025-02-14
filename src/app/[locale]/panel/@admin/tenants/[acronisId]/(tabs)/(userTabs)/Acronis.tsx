import { useCallback, useMemo, useState } from "react";
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
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import BoolChip from "@/components/BoolChip";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";

import { DateTimeFormat } from "@/utils/date";
import {
    LuAlertCircle,
    LuCheck,
    LuChevronsUpDown,
    LuLoader2,
    LuMoreHorizontal,
} from "react-icons/lu";

type Props = {
    t: Function;
    tenant: Tenant;
};

const userFormSchema = z.object({
    id: z.string().uuid().optional(),
    enabled: z.boolean(),
    login: z
        .string({
            required_error: "Customer.login.required",
        })
        .regex(/^[a-zA-Z0-9@!#$%^&*()+=\-[\]\\';,/{}|":<>?~`\s]+$/, {
            message: "Customer.login.invalidType",
        })
        .min(4, {
            message: "Customer.login.minLength",
        }),
    firstname: z.string({
        required_error: "User.firstname.required",
    }),
    lastname: z.string({
        required_error: "User.lastname.required",
    }),
    email: z
        .string({
            required_error: "User.email.required",
        })
        .email({
            message: "User.email.invalidType",
        }),
    phone: z
        .string()
        .max(15, "User.phone.maxLength")
        .refine(
            (value) => /^[0-9]*$/.test(value ?? ""),
            "User.phone.invalidType",
        )
        .optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AcronisTab({ t, tenant }: Props) {
    const tu = useTranslations("Users");
    const tf = useTranslations("FormMessages.User");

    const [open, setOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loginAlreadyTaken, setLoginAlreadyTaken] = useState(false);
    const [loginCheckLoading, setLoginCheckLoading] = useState(false);
    const [loginValid, setLoginValid] = useState(false);

    const {
        data: users,
        error,
        isLoading,
        mutate,
    } = useSWR(
        `/api/acronis/users?tenantId=${tenant.id}&withAccessPolicies=true`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Form
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            enabled: true,
        },
    });

    function onSubmit(values: UserFormValues) {
        if (submitting) return;
        setSubmitting(true);

        let user: any = {
            enabled: values.enabled,
            contact: {
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                phone: values.phone,
            },
        };

        if (isNew) {
            user.login = values.login;
            user.kind = tenant.kind;
            user.tenant_id = tenant.id;

            fetch("/api/acronis/users", {
                method: "POST",
                body: JSON.stringify(user),
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

                    setSubmitting(false);
                });
        } else {
            fetch(`/api/acronis/users/${values.id}`, {
                method: "PUT",
                body: JSON.stringify(user),
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

                    setSubmitting(false);
                });
        }
    }
    //#endregion

    //#region Table
    const visibleColumns = {
        created_at: false,
        updated_at: false,
    };

    const columns: ColumnDef<TenantUser, any>[] = [
        {
            accessorKey: "login",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("username")}
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
                const data: string = row.getValue("login");

                return data || "-";
            },
        },
        {
            accessorKey: "contactFullName",
            header: t("fullName"),
            enableHiding: false,
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");
                const name =
                    contact?.firstname && contact?.lastname
                        ? contact.firstname + " " + contact.lastname
                        : contact?.firstname || contact?.lastname || null;

                return name || "-";
            },
        },
        {
            accessorKey: "contactEmail",
            header: t("email"),
            enableHiding: false,
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");

                return contact?.email || "-";
            },
        },
        {
            accessorKey: "contactPhone",
            header: t("phone"),
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");

                return contact?.phone || "-";
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
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return (
                    <BoolChip
                        size="size-4"
                        value={data === "enabled" ? true : false}
                    />
                );
            },
        },
        {
            accessorKey: "notifications",
            header: t("notifications"),
            cell: ({ row }) => {
                const notifications: string[] = row.getValue("notifications");

                if (!notifications) return "-";
                return (
                    <div className="*:before:content-['•'] *:before:mr-1">
                        {notifications.map((n) => {
                            return <p key={n}>{tu("Notifications." + n)}</p>;
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "access_policies",
            header: t("roles"),
            cell: ({ row }) => {
                const accessPolicies: any[] = row.getValue("access_policies");

                if (!accessPolicies) return "-";
                return (
                    <div className="*:before:content-['•'] *:before:mr-1">
                        {accessPolicies.map((r) => {
                            return (
                                <p key={r.role_id}>
                                    {tu("Roles." + r.role_id)}
                                </p>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "contact",
            header: t("contactTypes"),
            cell: ({ row }) => {
                const contact: TenantContact = row.getValue("contact");

                if (!contact?.types) return "-";
                return (
                    <div className="*:before:content-['•'] *:before:mr-1">
                        {contact?.types?.map((t) => {
                            return <p key={t}>{tu("ContactTypes." + t)}</p>;
                        })}
                    </div>
                );
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
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: TenantUser = row.original;
                const user = {
                    id: data.id,
                    login: data.login,
                    enabled: data.enabled,
                    firstname: data.contact.firstname,
                    lastname: data.contact.lastname,
                    email: data.contact.email,
                    phone: data.contact.phone,
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuMoreHorizontal className="size-4 text-muted-foreground cursor-pointer hover:text-blue-500 active:text-blue-500/60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsNew(false);
                                    setOpen(true);
                                    form.reset(user);
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem>

                            {/* 
                            <DropdownMenuItem
                                onClick={() => {
                                    // setIsNew(false);
                                    // setOpen(true);
                                    // form.reset(user);
                                }}
                            >
                                {t("editNotifications")}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    // setIsNew(false);
                                    // setOpen(true);
                                    // form.reset(user);
                                }}
                            >
                                {t("setRoleToReadonly")}
                            </DropdownMenuItem> */}

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {t("delete")}
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("areYouSure")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("areYouSureDescription")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="text-sm text-muted-foreground">
                                        {t("selectedItem", {
                                            name: user.login,
                                        })}
                                    </div>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            {t("close")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button
                                                disabled={submitting}
                                                variant="destructive"
                                                className="bg-destructive hover:bg-destructive/90"
                                                onClick={() => {
                                                    setSubmitting(true);

                                                    fetch(
                                                        `/api/acronis/users/${user.id}`,
                                                        {
                                                            method: "DELETE",
                                                        },
                                                    )
                                                        .then((res) =>
                                                            res.json(),
                                                        )
                                                        .then((res) => {
                                                            if (res.ok) {
                                                                toast({
                                                                    description:
                                                                        res.message,
                                                                });
                                                                mutate();
                                                            } else {
                                                                toast({
                                                                    variant:
                                                                        "destructive",
                                                                    title: t(
                                                                        "errorTitle",
                                                                    ),
                                                                    description:
                                                                        res.message,
                                                                });
                                                            }
                                                        })
                                                        .finally(() => {
                                                            setSubmitting(
                                                                false,
                                                            );
                                                        });
                                                }}
                                            >
                                                {t("delete")}
                                                {submitting && (
                                                    <LuLoader2 className="size-4 animate-spin ml-2" />
                                                )}
                                            </Button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    //#endregion

    //#region Check Login Debounce
    const debounce = (fn: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    };

    const checkLoginAvailability = useCallback(
        async (username: string) => {
            if (username.length < 4) return;

            const loginRegex =
                /^[a-zA-Z0-9@!#$%^&*()+=\-[\]\\';,/{}|":<>?~`\s]+$/;
            if (!loginRegex.test(username)) {
                setLoginValid(false);
                setLoginAlreadyTaken(false);
                form.setError("login", {
                    type: "manual",
                    message: "Customer.login.invalidType",
                });
                return;
            }

            setLoginValid(false);
            setLoginAlreadyTaken(false);
            setLoginCheckLoading(true);

            try {
                const res = await fetch(
                    `/api/acronis/users/checkLogin?username=${username}`,
                );
                const data = await res.json();

                if (data.ok) {
                    setLoginAlreadyTaken(false);
                    setLoginValid(true);
                    form.clearErrors("login");
                } else {
                    setLoginAlreadyTaken(true);
                    setLoginValid(false);
                    form.setError("login", {
                        type: "manual",
                        message: "Customer.login.alreadyTaken",
                    });
                }
            } catch (error) {
                setLoginAlreadyTaken(true);
                setLoginValid(false);
                form.setError("login", {
                    type: "manual",
                    message: "Customer.login.checkFailed",
                });
            } finally {
                setLoginCheckLoading(false);
            }
        },
        [form],
    );

    const debouncedCheckLogin = useMemo(
        () => debounce(checkLoginAvailability, 500),
        [checkLoginAvailability],
    );
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
                data={users.items || []}
                visibleColumns={visibleColumns}
                isLoading={isLoading}
                defaultPageSize={30}
                facetedFilters={[
                    {
                        column: "enabled",
                        title: t("enabled"),
                        options: [
                            { value: true, label: t("true") },
                            { value: false, label: t("false") },
                        ],
                    },
                ]}
                onAddNew={() => {
                    setIsNew(true);
                    setOpen(true);
                    form.reset({ enabled: true });
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? t("newUser") : t("editUser")}
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
                                    name="enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    {t("enabled")}
                                                </FormLabel>
                                                <FormDescription>
                                                    {tf("enabled.description")}
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

                            {isNew && (
                                <FormField
                                    control={form.control}
                                    name="login"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                {t("username")}
                                            </FormLabel>
                                            <FormDescription>
                                                {tf("login.description")}
                                            </FormDescription>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <Input
                                                        {...field}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target.value;
                                                            field.onChange(
                                                                value,
                                                            );

                                                            // Reset states if input is too short
                                                            if (
                                                                value.length < 4
                                                            ) {
                                                                setLoginValid(
                                                                    false,
                                                                );
                                                                setLoginAlreadyTaken(
                                                                    false,
                                                                );
                                                                setLoginCheckLoading(
                                                                    false,
                                                                );
                                                                return;
                                                            }

                                                            debouncedCheckLogin(
                                                                value,
                                                            );
                                                        }}
                                                    />
                                                    {loginCheckLoading && (
                                                        <LuLoader2 className="size-4 text-blue-400 animate-spin absolute right-2" />
                                                    )}
                                                    {loginAlreadyTaken && (
                                                        <LuAlertCircle className="size-4 text-destructive absolute right-2" />
                                                    )}
                                                    {loginValid && (
                                                        <LuCheck className="size-4 text-green-600 absolute right-2" />
                                                    )}
                                                </div>
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
                            )}

                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("firstname")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.firstname
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("lastname")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.lastname
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

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("phone")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.phone
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
