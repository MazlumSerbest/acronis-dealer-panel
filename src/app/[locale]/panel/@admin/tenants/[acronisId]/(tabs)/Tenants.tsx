import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";

import { DateFormat } from "@/utils/date";
import {
    LuChevronsUpDown,
    LuLoader2,
    LuAlertCircle,
    LuCheck,
    LuInfo,
    LuAlertTriangle,
} from "react-icons/lu";
import useUserStore from "@/store/user";
import { calculateRemainingDays, formatBytes } from "@/utils/functions";
import { cn } from "@/lib/utils";

type Props = {
    t: Function;
    tenant: Tenant;
};

const tenantFormSchema = z.object({
    kind: z.enum(["partner", "customer"]),
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

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export default function TenantsTab({ t, tenant }: Props) {
    const tf = useTranslations("FormMessages.Customer");
    const router = useRouter();
    const { user: currentUser } = useUserStore();

    const [updatedTenants, setUpdatedTenants] = useState(undefined);

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loginAlreadyTaken, setLoginAlreadyTaken] = useState(false);
    const [loginCheckLoading, setLoginCheckLoading] = useState(false);
    const [loginValid, setLoginValid] = useState(false);

    // #region Fetch Data
    const {
        data: tenants,
        error,
        isLoading,
        mutate,
    } = useSWR(`/api/acronis/tenants/children/${tenant.id}`, null, {
        revalidateOnFocus: false,
        onSuccess: async (data) => {
            if (!data) return;

            try {
                const [customersResponse, partnersResponse] = await Promise.all(
                    [
                        fetch(`/api/customer?partnerAcronisId=${tenant.id}`),
                        fetch(`/api/partner?parentAcronisId=${tenant.id}`),
                    ],
                );

                const [customers, partners] = await Promise.all([
                    customersResponse.json(),
                    partnersResponse.json(),
                ]);

                const newData = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    kind: item.kind,
                    enabled: item.enabled,
                    mfa_status: item.mfa_status,
                    licensed:
                        item.kind === "partner"
                            ? partners.find(
                                  (p: Partner) => p.acronisId === item.id,
                              )?.licensed
                            : null,
                    billingDate:
                        item.kind === "customer"
                            ? customers.find(
                                  (c: Customer) => c.acronisId === item.id,
                              )?.billingDate
                            : partners.find(
                                  (p: Partner) => p.acronisId === item.id,
                              )?.billingDate,
                    usages: item.usages,
                }));

                setUpdatedTenants(newData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
    });
    // #endregion

    //#region Form
    const form = useForm<TenantFormValues>({
        resolver: zodResolver(tenantFormSchema),
        mode: "onChange",
        defaultValues: {
            kind: "customer",
        },
    });

    function onSubmit(values: TenantFormValues) {
        if (submitting || loginAlreadyTaken || !loginValid) return;
        setSubmitting(true);

        const newTenant = {
            name: values.name,
            login: values.login,
            parentAcronisId: tenant.id,
            partnerAcronisId: tenant.id,
            kind: values.kind,
            licensed: currentUser?.licensed,
            contact: {
                email: values.email,
            },
        };

        fetch("/api/acronis/tenants", {
            method: "POST",
            body: JSON.stringify(newTenant),
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
    //#endregion

    // #region Table
    const visibleColumns = {};

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

                return (
                    <h6>
                        {data
                            ? data === "partner"
                                ? t("partner")
                                : t("customer")
                            : "-"}
                    </h6>
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "mfa_status",
            header: t("mfaStatus"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("mfa_status");

                return <BoolChip size="size-4" value={data === "enabled"} />;
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
            accessorKey: "licensed",
            header: t("licensed"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("licensed");
                const kind: string = row.getValue("kind");

                return kind === "partner" ? (
                    <BoolChip size="size-4" value={data} />
                ) : (
                    "-"
                );
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

                return !updatedTenants ? (
                    <Skeleton>
                        <div className="rounded-sm bg-slate-200 w-full h-5"></div>
                    </Skeleton>
                ) : (
                    <div className="flex flex-row gap-2">
                        {DateFormat(data)}
                        {data &&
                            (new Date(data) < new Date() ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <LuAlertTriangle className="size-4 text-destructive" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("billingDatePassed")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : new Date(data) <
                              new Date(Date.now() + 12096e5) ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <LuInfo className="size-4 text-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {t("lessThanTwoWeeksUntilBilling")}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : null)}
                    </div>
                );
            },
        },
        {
            accessorKey: "remainingDays",
            header: t("remainingDays"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("billingDate");
                const remainingDays = calculateRemainingDays(data);

                return !updatedTenants ? (
                    <Skeleton>
                        <div className="rounded-sm bg-slate-200 w-full h-5"></div>
                    </Skeleton>
                ) : data ? (
                    remainingDays > 0 ? (
                        remainingDays
                    ) : (
                        "0"
                    )
                ) : (
                    "-"
                );
            },
        },
        {
            accessorKey: "usages",
            enableHiding: false,
            enableGlobalFilter: false,
            header: () => (
                <div className="flex flex-col gap-2 py-3">
                    <span className="mx-auto">{`${t("totalUsages")} / ${t(
                        "quota",
                    )}`}</span>

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

                return (
                    <div className="grid grid-cols-2 justify-items-center">
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    !data?.perWorkload?.quota ||
                                        data?.perWorkload?.quota?.value === null
                                        ? ""
                                        : data?.perWorkload?.value >
                                          data?.perWorkload?.quota?.value
                                        ? "text-destructive"
                                        : data?.perWorkload?.value >
                                          data?.perWorkload?.quota?.value * 0.9
                                        ? "text-yellow-500"
                                        : "",
                                )}
                            >
                                {data?.perWorkload?.value
                                    ? formatBytes(data?.perWorkload?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perWorkload?.quota &&
                                data?.perWorkload?.quota?.value !== null
                                    ? ` / ${formatBytes(
                                          data?.perWorkload?.quota?.value,
                                      )}`
                                    : ""}
                            </span>
                        </p>
                        <p className="grid grid-cols-2 justify-items-center gap-2">
                            <span
                                className={cn(
                                    !data?.perGB?.quota ||
                                        data?.perGB?.quota?.value === null
                                        ? ""
                                        : data?.perGB?.value >
                                          data?.perGB?.quota?.value
                                        ? "text-destructive"
                                        : data?.perGB?.value >
                                          data?.perGB?.quota?.value * 0.9
                                        ? "text-yellow-500"
                                        : "",
                                )}
                            >
                                {data?.perGB?.value
                                    ? formatBytes(data?.perGB?.value)
                                    : "-"}
                            </span>
                            <span className="text-muted-foreground">
                                {data?.perGB?.quota &&
                                data?.perGB?.quota?.value !== null
                                    ? ` / ${formatBytes(
                                          data?.perGB?.quota?.value,
                                      )}`
                                    : ""}
                            </span>
                        </p>
                    </div>
                );
            },
        },
    ];
    // #endregion

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
                data={updatedTenants || tenants}
                columns={columns}
                visibleColumns={visibleColumns}
                defaultPageSize={50}
                defaultSort="name"
                defaultSortDirection="asc"
                facetedFilters={[
                    {
                        column: "kind",
                        title: t("kind"),
                        options: [
                            { value: "partner", label: t("partner") },
                            { value: "customer", label: t("customer") },
                        ],
                    },
                    {
                        column: "mfa_status",
                        title: t("mfaStatus"),
                        options: [
                            { value: "enabled", label: t("enabled") },
                            { value: "disabled", label: t("disabled") },
                        ],
                    },
                    {
                        column: "enabled",
                        title: t("enabled"),
                        options: [
                            { value: true, label: t("true") },
                            { value: false, label: t("false") },
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
                ]}
                onAddNew={() => {
                    setOpen(true);
                }}
                onClick={(item) => {
                    router.push("/panel/tenants/" + item?.original?.id);
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("newTenant")}</DialogTitle>
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
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
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
                                                form?.formState?.errors?.name
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
                                                            e.target.value;
                                                        field.onChange(value);

                                                        // Reset states if input is too short
                                                        if (value.length < 4) {
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
                                                form?.formState?.errors?.login
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
                                        submitting
                                    }
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
