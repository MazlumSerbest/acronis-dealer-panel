"use client";
import { useCallback, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";
import PageHeader from "@/components/PageHeader";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";

import { DateFormat, DateTimeFormat } from "@/utils/date";
import {
    LuChevronsUpDown,
    LuLoader2,
    LuAlertCircle,
    LuCheck,
    LuInfo,
    LuAlertTriangle,
} from "react-icons/lu";
import useUserStore from "@/store/user";
import { formatBytes } from "@/utils/functions";
import { cn } from "@/lib/utils";

const customerFormSchema = z.object({
    kind: z.enum(["customer", "partner"]),
    name: z
        .string({
            required_error: "Customer.name.required",
        })
        .min(6, {
            message: "Customer.name.minLength",
        }),
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
    email: z
        .string({
            required_error: "Customer.email.required",
        })
        .email({
            message: "Customer.email.invalidType",
        }),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomersPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Customer");
    const router = useRouter();
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();
    const [updatedData, setUpdatedData] = useState<any[]>([]);

    const [open, setOpen] = useState(false);
    const [loginAlreadyTaken, setLoginAlreadyTaken] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginCheckLoading, setLoginCheckLoading] = useState(false);
    const [loginValid, setLoginValid] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        currentUser?.acronisTenantId
            ? `/api/acronis/tenants/children/${currentUser.acronisTenantId}`
            : null,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: async (data) => {
                if (!data) return;

                const [customersResponse, partnersResponse] = await Promise.all(
                    [
                        fetch(
                            `/api/customer?partnerAcronisId=${currentUser?.partnerAcronisId}`,
                        ),
                        fetch(
                            `/api/partner?parentAcronisId=${currentUser?.acronisTenantId}`,
                        ),
                    ],
                );

                const [customers, partners] = await Promise.all([
                    customersResponse.json(),
                    partnersResponse.json(),
                ]);

                const newData = data.map((item: any) => {
                    const newItem = {
                        id: item.id,
                        name: item.name,
                        kind: item.kind,
                        enabled: item.enabled,
                        mfa_status: item.mfa_status,
                        billingDate: "",
                        usages: item.usages,
                    };

                    if (item.kind === "customer") {
                        const customer = customers.find(
                            (customer: Customer) =>
                                customer.acronisId === item.id,
                        );
                        newItem.billingDate =
                            customer?.billingDate || undefined;
                    } else if (item.kind === "partner") {
                        const partner = partners.find(
                            (partner: Partner) => partner.acronisId === item.id,
                        );
                        newItem.billingDate = partner?.billingDate || undefined;
                    }

                    return newItem;
                });

                setUpdatedData(newData);
            },
        },
    );

    //#region Form
    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        mode: "onChange",
        defaultValues: {
            kind: "customer",
        },
    });

    function onSubmit(values: CustomerFormValues) {
        setIsSubmitting(true);

        const customer = {
            name: values.name,
            login: values.login,
            parentAcronisId: currentUser?.acronisTenantId,
            partnerAcronisId: currentUser?.partnerAcronisId,
            kind: values.kind,
            contact: {
                email: values.email,
            },
        };

        fetch("/api/acronis/tenants", {
            method: "POST",
            body: JSON.stringify(customer),
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
                setIsSubmitting(false);
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

                return data || "-";
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
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "enabled",
            header: t("enabled"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("enabled");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "billingDate",
            enableHiding: false,
            enableGlobalFilter: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("billingDate")}
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
                const data: string = row.getValue("billingDate");

                return (
                    <div className="flex flex-row gap-2">
                        {DateFormat(data)}
                        {data &&
                            (new Date(data) < new Date() ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <LuAlertTriangle className="size-4 text-destructive" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t("billingDatePassed")}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : new Date(data) <
                              new Date(Date.now() + 12096e5) ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <LuInfo className="size-4 text-yellow-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t("lessThanTwoWeeksUntilBilling")}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : null)}
                    </div>
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "usages",
            enableHiding: false,
            enableGlobalFilter: false,
            header: () =>
                currentUser?.licensed ? (
                    <div className="flex flex-row justify-center">
                        {t("usages")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 py-3">
                        <span className="mx-auto">{t("totalUsages")}</span>

                        <div className="grid grid-cols-2 justify-items-center">
                            <p className="flex flex-row gap-2">
                                {t("perWorkload")}
                            </p>
                            <p className="flex flex-row gap-2">{t("perGB")}</p>
                        </div>
                    </div>
                ),
            cell: ({ row }) => {
                const data: any = row.getValue("usages");

                return currentUser?.licensed ? (
                    <div className="flex flex-row justify-center gap-4">
                        <span
                            className={cn(
                                data?.perGB?.quota &&
                                    data?.perGB?.value > data?.perGB?.quota
                                    ? "text-destructive"
                                    : "",
                            )}
                        >
                            {data?.perGB?.value
                                ? formatBytes(data?.perGB?.value)
                                : "-"}
                        </span>
                        <span className="text-muted-foreground">
                            {data?.perGB?.quota
                                ? ` / ${formatBytes(data?.perGB?.quota)}`
                                : ""}
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 justify-items-center">
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    data?.perWorkload?.quota &&
                                        data?.perWorkload?.value >
                                            data?.perWorkload?.quota
                                        ? "text-destructive"
                                        : "",
                                )}
                            >
                                {data?.perWorkload?.value
                                    ? formatBytes(data?.perWorkload?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perWorkload?.quota
                                    ? ` / ${formatBytes(
                                          data?.perWorkload?.quota,
                                      )}`
                                    : ""}
                            </span>
                        </p>
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    data?.perGB?.quota &&
                                        data?.perGB?.value > data?.perGB?.quota
                                        ? "text-destructive"
                                        : "",
                                )}
                            >
                                {data?.perGB?.value
                                    ? formatBytes(data?.perGB?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perGB?.quota
                                    ? ` / ${formatBytes(data?.perGB?.quota)}`
                                    : ""}
                            </span>
                        </p>
                    </div>
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

    if (error) return <div>{t("failedToLoad")}</div>;
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("customers")} />
            {!data ? (
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            ) : (
                <>
                    <DataTable
                        zebra
                        data={updatedData || data}
                        columns={columns}
                        visibleColumns={visibleColumns}
                        defaultPageSize={50}
                        defaultSort="name"
                        defaultSortDirection="asc"
                        isLoading={isLoading}
                        facetedFilters={[
                            {
                                column: "kind",
                                title: t("kind"),
                                options: [
                                    {
                                        value: "customer",
                                        label: t("customer"),
                                    },
                                    {
                                        value: "partner",
                                        label: t("partner"),
                                    },
                                ],
                            },
                            {
                                column: "mfa_status",
                                title: t("mfaStatus"),
                                options: [
                                    {
                                        value: "enabled",
                                        label: t("enabled"),
                                    },
                                    {
                                        value: "disabled",
                                        label: t("disabled"),
                                    },
                                ],
                            },
                            {
                                column: "enabled",
                                title: t("enabled"),
                                options: [
                                    {
                                        value: true,
                                        label: t("true"),
                                    },
                                    {
                                        value: false,
                                        label: t("false"),
                                    },
                                ],
                            },
                        ]}
                        onAddNew={() => {
                            setOpen(true);
                        }}
                        onClick={(item) => {
                            router.push("customers/" + item?.original?.id);
                        }}
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("newCustomer")}</DialogTitle>
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
                                        name="kind"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                    {t("kind")}
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="customer" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {t("customer")}
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="partner" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {t("partner")}
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
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
                                                    {tf("login.description")}
                                                </FormDescription>
                                                <FormControl>
                                                    <div className="relative flex items-center">
                                                        <Input
                                                            {...field}
                                                            onChange={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                field.onChange(
                                                                    value,
                                                                );

                                                                // Reset states if input is too short
                                                                if (
                                                                    value.length <
                                                                    4
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
                                                            <LuLoader2 className="size-4 animate-spin absolute right-2" />
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
                                            disabled={
                                                loginCheckLoading ||
                                                loginAlreadyTaken ||
                                                isSubmitting
                                            }
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-600/90"
                                        >
                                            {t("save")}
                                            {isSubmitting && (
                                                <LuLoader2 className="size-4 animate-spin ml-2" />
                                            )}
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
