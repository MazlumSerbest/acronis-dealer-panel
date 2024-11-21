import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Form, FormField, FormItem } from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import DatePicker from "@/components/DatePicker";
import StorageCard from "@/components/cards/Storage";
import UsageCard from "@/components/cards/Usage";
import SmallCard from "@/components/cards/SmallCard";

import { calculateRemainingDays } from "@/utils/functions";
import { DateFormat, DateTimeFormat } from "@/utils/date";
import useUserStore from "@/store/user";
import {
    LuAlertTriangle,
    LuArrowUpRight,
    LuInfo,
    LuLoader2,
    LuPencil,
    LuShield,
    LuShieldAlert,
    LuShieldCheck,
    LuShieldOff,
    LuSigma,
} from "react-icons/lu";

type Props = {
    t: Function;
    tenant: Tenant;
};

const partnerFormSchema = z.object({
    billingDate: z.date().optional(),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function GeneralTab({ t, tenant }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();
    const [openPartnerDialog, setOpenPartnerDialog] = useState(false);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [edit, setEdit] = useState(false);
    const [daysUntilNextBillingDate, seDaysUntilNextBillingDate] = useState(0);
    const [licensed, setLicensed] = useState<boolean>(true);

    const [usagesPerWorkload, setUsagesPerWorkload] = useState<TenantUsage[]>();
    const [usagesPerGB, setUsagesPerGB] = useState<TenantUsage[]>();

    const [inactiveLicenseCount, setInactiveLicenseCount] = useState<number>(0);
    const [activeLicenseCount, setActiveLicenseCount] = useState<number>(0);
    const [completedLicenseCount, setCompletedLicenseCount] =
        useState<number>(0);
    const [expiredLicenseCount, setExpiredLicenseCount] = useState<number>(0);
    const [totalLicenseCount, setTotalLicenseCount] = useState<number>(0);

    // #region Fetch Data
    const {
        data: panelTenant,
        error: panelTenantError,
        mutate: panelTenantMutate,
    } = useSWR(`/api/admin/${tenant?.kind}/${tenant?.id}`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            const daysDiff = calculateRemainingDays(data.billingDate);
            seDaysUntilNextBillingDate(daysDiff);
        },
    });

    const {
        data: usages,
        error: usagesError,
        mutate: usagesMutate,
    } = useSWR(`/api/acronis/usages/${tenant?.id}`, null, {
        revalidateOnFocus: false,
        onSuccess: async (data) => {
            setUsagesPerWorkload(
                data?.usages?.items?.filter(
                    (u: TenantUsage) =>
                        u.value > 0 &&
                        u.edition === "pck_per_workload" &&
                        u.usage_name != "storage" &&
                        u.usage_name != "storage_total",
                ),
            );
            setUsagesPerGB(
                data?.usages?.items?.filter(
                    (u: TenantUsage) =>
                        u.value > 0 &&
                        u.edition === "pck_per_gigabyte" &&
                        u.usage_name != "storage" &&
                        u.usage_name != "storage_total",
                ),
            );

            if (panelTenant?.licensed && tenant.kind === "partner") {
                const inactive = await fetch(
                    `/api/license/count?status=inactive&partnerAcronisId=${tenant.id}`,
                );
                const inactiveCount = await inactive.json();
                setInactiveLicenseCount(inactiveCount.count);

                const active = await fetch(
                    `/api/license/count?status=active&partnerAcronisId=${tenant.id}`,
                );
                const activeCount = await active.json();
                setActiveLicenseCount(activeCount.count);

                const completed = await fetch(
                    `/api/license/count?status=completed&partnerAcronisId=${tenant.id}`,
                );
                const completedCount = await completed.json();
                setCompletedLicenseCount(completedCount.count);

                const expired = await fetch(
                    `/api/license/count?status=expired&partnerAcronisId=${tenant.id}`,
                );
                const expiredCount = await expired.json();
                setExpiredLicenseCount(expiredCount.count);

                setTotalLicenseCount(inactiveCount.count + activeCount.count);
            } else if (panelTenant?.licensed && tenant.kind === "customer") {
                const active = await fetch(
                    `/api/license/count?status=active&customerAcronisId=${tenant.id}`,
                );
                const activeCount = await active.json();
                setActiveLicenseCount(activeCount.count);

                const completed = await fetch(
                    `/api/license/count?status=completed&customerAcronisId=${tenant.id}`,
                );
                const completedCount = await completed.json();
                setCompletedLicenseCount(completedCount.count);
            }
        },
    });
    // #endregion

    //#region Form
    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
    });

    async function onSubmit(values: PartnerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        const existingPartner = {
            name: tenant?.name,
            billingDate: values.billingDate?.toISOString(),
        };
        if (panelTenant)
            fetch(`/api/admin/partner/${tenant?.id}`, {
                method: "PUT",
                body: JSON.stringify(existingPartner),
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        toast({
                            description: res.message,
                        });
                        panelTenantMutate();
                        setEdit(false);
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

    if (usagesError) return <div>{t("failedToLoad")}</div>;
    return (
        <div className="container grid grid-cols-3 gap-4">
            {usages?.usages?.items?.some(
                (u: TenantUsage) =>
                    u.offering_item?.quota?.value !== null &&
                    u.offering_item?.quota?.value !== undefined &&
                    u.value > u.offering_item.quota.value,
            ) && (
                <Alert className="col-span-3" variant="destructive">
                    <LuAlertTriangle className="size-4" />
                    <AlertTitle>{t("limitExceeded")}</AlertTitle>
                    <AlertDescription>
                        {t("limitExceededDescription")}
                    </AlertDescription>
                </Alert>
            )}

            {tenant.parent_id === currentUser?.acronisTenantId &&
                panelTenant?.billingDate &&
                (new Date(panelTenant?.billingDate) < new Date() ? (
                    <Alert className="col-span-3" variant="destructive">
                        <LuAlertTriangle className="size-4" />
                        <AlertTitle>{t("billingDatePassed")}</AlertTitle>
                        <AlertDescription>
                            {t("billingDatePassedDescription")}
                        </AlertDescription>
                    </Alert>
                ) : daysUntilNextBillingDate &&
                  daysUntilNextBillingDate < 15 ? (
                    <Alert
                        className="col-span-3 text-yellow-500 border-yellow-500"
                        variant="default"
                    >
                        <LuInfo className="size-4 !text-yellow-500" />
                        <AlertTitle>
                            {t("lessThanTwoWeeksUntilBilling")}
                        </AlertTitle>
                        <AlertDescription>
                            {t("lessThanTwoWeeksUntilBillingDescription")}
                        </AlertDescription>
                    </Alert>
                ) : null)}

            <div className="col-span-full md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row justify-between">
                            <h2 className="flex-none font-medium text-xl">
                                {t("tenantInformation")}
                            </h2>

                            {panelTenant &&
                                tenant.parent_id ==
                                    currentUser?.acronisTenantId && (
                                    <Button
                                        disabled={edit}
                                        size="sm"
                                        className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                                        onClick={() => {
                                            form.reset(panelTenant);
                                            setEdit(true);
                                        }}
                                    >
                                        <span className="sr-only lg:not-sr-only">
                                            {t("edit")}
                                        </span>
                                        <LuPencil className="size-4" />
                                    </Button>
                                )}
                        </CardTitle>
                        {edit ? (
                            <></>
                        ) : (
                            <CardDescription className="hover:underline">
                                <Link
                                    target="_blank"
                                    href={`https://tr01-cloud.acronis.com/mc/app;group_id=${tenant?.parent_id}/clients;focused_tenant_uuid=${tenant?.id}`}
                                >
                                    {t("showOnAcronis")}
                                    <LuArrowUpRight className="ml-1 size-4 inline-block" />
                                </Link>
                            </CardDescription>
                        )}
                    </CardHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:items-center *:px-4 *:py-2">
                                <div>
                                    <dt className="font-medium">{t("name")}</dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {tenant?.name || "-"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="font-medium">
                                        {t("acronisId")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {tenant?.id || "-"}
                                    </dd>
                                </div>

                                {tenant.kind == "partner" ? (
                                    <div>
                                        <dt className="font-medium">
                                            {t("upperPartner")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                            {panelTenant?.parent.name || "-"}
                                        </dd>
                                    </div>
                                ) : (
                                    <div>
                                        <dt className="font-medium">
                                            {t("partnerName")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                            {panelTenant?.partner.name || "-"}
                                        </dd>
                                    </div>
                                )}

                                <div>
                                    <dt className="font-medium">
                                        {t("enabled")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        <BoolChip
                                            value={tenant?.enabled || false}
                                        />
                                    </dd>
                                </div>

                                <div>
                                    <dt className="font-medium">{t("kind")}</dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {t(tenant?.kind || "")}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="font-medium">
                                        {t("email")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {tenant?.contact?.email || "-"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="font-medium">
                                        {t("mfaStatus")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        <BoolChip
                                            value={
                                                tenant?.mfa_status == "enabled"
                                            }
                                        />
                                    </dd>
                                </div>

                                <div>
                                    <dt className="font-medium">
                                        {t("billingDate")}
                                    </dt>
                                    {edit ? (
                                        <FormField
                                            control={form.control}
                                            name="billingDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <DatePicker field={field} />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                            {panelTenant?.billingDate ? (
                                                <div className="flex flex-row gap-1">
                                                    {DateFormat(
                                                        panelTenant?.billingDate,
                                                    )}
                                                    {daysUntilNextBillingDate >
                                                    0
                                                        ? ` (${t(
                                                              "daysUntilNextBillingDate",
                                                              {
                                                                  days: daysUntilNextBillingDate,
                                                              },
                                                          )})`
                                                        : ` (${t(
                                                              "billingDatePassed",
                                                          )})`}
                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </dd>
                                    )}
                                </div>

                                <div>
                                    <dt className="font-medium">
                                        {t("createdAt")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {DateTimeFormat(
                                            tenant?.created_at || "",
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="font-medium">
                                        {t("updatedAt")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {DateTimeFormat(
                                            tenant?.updated_at || "",
                                        )}
                                    </dd>
                                </div>

                                {tenant.kind == "partner" && (
                                    <>
                                        <div>
                                            <dt className="font-medium">
                                                {t("panelPartner")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                                <BoolChip
                                                    value={!!panelTenant}
                                                />
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="font-medium">
                                                {t("panelUser")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                                <BoolChip
                                                    value={
                                                        panelTenant?.users
                                                            ?.length
                                                    }
                                                />
                                            </dd>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            {edit && (
                                <CardFooter className="flex flex-row gap-2 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEdit(false);
                                        }}
                                    >
                                        {t("cancel")}
                                    </Button>
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
                                </CardFooter>
                            )}
                        </form>
                    </Form>
                    {!edit &&
                        tenant.parent_id == currentUser?.acronisTenantId &&
                        (!panelTenant || panelTenant?.users?.length == 0) && (
                            <CardFooter className="flex flex-row justify-end gap-2">
                                {panelTenant && !panelTenant?.users?.length && (
                                    <AlertDialog
                                        open={openUserDialog}
                                        onOpenChange={setOpenUserDialog}
                                    >
                                        <AlertDialogTrigger asChild>
                                            <Button className="bg-blue-400 hover:bg-blue-400/90">
                                                {t("createUser")}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {t("createUser")}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t("createUserWarning")}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel asChild>
                                                    <Button variant="outline">
                                                        {t("cancel")}
                                                    </Button>
                                                </AlertDialogCancel>
                                                <Button
                                                    disabled={submitting}
                                                    className="bg-blue-400 hover:bg-blue-400/90"
                                                    onClick={() => {
                                                        if (submitting) return;
                                                        setSubmitting(true);

                                                        fetch(
                                                            `/api/admin/user`,
                                                            {
                                                                method: "POST",
                                                                body: JSON.stringify(
                                                                    {
                                                                        partnerAcronisId:
                                                                            tenant?.id,
                                                                        name: tenant?.name,
                                                                        email: tenant
                                                                            ?.contact
                                                                            ?.email,
                                                                        role: "partner",
                                                                    },
                                                                ),
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
                                                                    setOpenUserDialog(
                                                                        false,
                                                                    );
                                                                    panelTenantMutate();
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
                                                                    setOpenPartnerDialog(
                                                                        false,
                                                                    );
                                                                }

                                                                setSubmitting(
                                                                    false,
                                                                );
                                                            });
                                                    }}
                                                >
                                                    {t("create")}
                                                    {submitting && (
                                                        <LuLoader2 className="size-4 animate-spin ml-2" />
                                                    )}
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                                {!panelTenant && tenant.kind == "partner" && (
                                    <AlertDialog
                                        open={openPartnerDialog}
                                        onOpenChange={setOpenPartnerDialog}
                                    >
                                        <AlertDialogTrigger asChild>
                                            <Button className="bg-blue-400 hover:bg-blue-400/90">
                                                {t("createPartner")}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {t("createPartner")}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t("createPartnerWarning")}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label
                                                        htmlFor="licensed"
                                                        className="text-sm font-medium"
                                                    >
                                                        {t("licensed")}
                                                    </Label>
                                                    <p className="text-[0.8rem] text-muted-foreground">
                                                        {t(
                                                            "licensedDescription",
                                                        )}
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="licensed"
                                                    checked={licensed}
                                                    onCheckedChange={
                                                        setLicensed
                                                    }
                                                />
                                            </div>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel asChild>
                                                    <Button variant="outline">
                                                        {t("cancel")}
                                                    </Button>
                                                </AlertDialogCancel>
                                                <Button
                                                    disabled={submitting}
                                                    className="bg-blue-400 hover:bg-blue-400/90"
                                                    onClick={() => {
                                                        if (submitting) return;
                                                        setSubmitting(true);

                                                        fetch(
                                                            `/api/admin/partner`,
                                                            {
                                                                method: "POST",
                                                                body: JSON.stringify(
                                                                    {
                                                                        acronisId:
                                                                            tenant?.id,
                                                                        parentAcronisId:
                                                                            tenant?.parent_id,
                                                                        name: tenant?.name,
                                                                        licensed:
                                                                            licensed,
                                                                    },
                                                                ),
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
                                                                    setOpenPartnerDialog(
                                                                        false,
                                                                    );
                                                                    panelTenantMutate();
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
                                                                    setOpenPartnerDialog(
                                                                        false,
                                                                    );
                                                                }

                                                                setSubmitting(
                                                                    false,
                                                                );
                                                            });
                                                    }}
                                                >
                                                    {t("create")}
                                                    {submitting && (
                                                        <LuLoader2 className="size-4 animate-spin ml-2" />
                                                    )}
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardFooter>
                        )}
                </Card>
            </div>

            {!usages ? (
                <Skeleton>
                    <div className="h-full w-full rounded-xl bg-slate-200"></div>
                </Skeleton>
            ) : (
                <div className="flex flex-col grid-cols-1 w-full col-span-full md:col-span-1 gap-4 justify-start">
                    {!panelTenant?.licensed && (
                        <StorageCard
                            title={t("storageCardTitle")}
                            description={t("storageCardDescriptionPW")}
                            model={t("perWorkload")}
                            usage={
                                usages?.usages?.items?.find(
                                    (u: TenantUsage) =>
                                        u.usage_name == "storage" &&
                                        u.edition == "pck_per_workload",
                                )?.value
                            }
                            quota={
                                usages?.usages?.items?.find(
                                    (u: TenantUsage) =>
                                        u.usage_name == "storage" &&
                                        u.edition == "pck_per_workload",
                                )?.offering_item.quota
                            }
                        />
                    )}

                    <StorageCard
                        title={t("storageCardTitle")}
                        description={t("storageCardDescriptionGB")}
                        model={t("perGB")}
                        usage={
                            usages?.usages?.items?.find(
                                (u: TenantUsage) =>
                                    u.usage_name == "storage" &&
                                    u.edition == "pck_per_gigabyte",
                            )?.value
                        }
                        quota={
                            usages?.usages?.items?.find(
                                (u: TenantUsage) =>
                                    u.usage_name == "storage" &&
                                    u.edition == "pck_per_gigabyte",
                            )?.offering_item.quota
                        }
                    />

                    {panelTenant?.licensed && (
                        <SmallCard
                            title={t("totalLicense")}
                            icon={
                                <LuSigma className="size-5 text-muted-foreground" />
                            }
                            value={totalLicenseCount}
                            description={`${t(
                                "totalSmallCardDescription",
                            )} (${t("active")} ${t("and")} ${t("passive")})`}
                        />
                    )}
                </div>
            )}

            <div className="col-span-full">
                <h2 className="font-medium text-xl">{t("licenses")}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 col-span-full">
                {tenant.kind == "partner" && (
                    <SmallCard
                        title={t("passive")}
                        icon={
                            <LuShield className="size-5 text-muted-foreground" />
                        }
                        value={inactiveLicenseCount}
                        description={t("passiveSmallCardDescription")}
                        onClick={() =>
                            router.push(
                                `${pathname}?tab=licenses&status=passive`,
                            )
                        }
                    />
                )}

                <SmallCard
                    title={t("active")}
                    icon={
                        <LuShieldCheck className="size-5 text-muted-foreground" />
                    }
                    value={activeLicenseCount}
                    description={t("activeSmallCardDescription")}
                    onClick={() =>
                        router.push(`${pathname}?tab=licenses&status=active`)
                    }
                />
                <SmallCard
                    title={t("completed")}
                    icon={
                        <LuShieldAlert className="size-5 text-muted-foreground" />
                    }
                    value={completedLicenseCount}
                    description={t("completedSmallCardDescription")}
                    onClick={() =>
                        router.push(`${pathname}?tab=licenses&status=completed`)
                    }
                />

                {tenant.kind === "partner" && (
                    <SmallCard
                        title={t("expired")}
                        icon={
                            <LuShieldOff className="size-5 text-muted-foreground" />
                        }
                        value={expiredLicenseCount}
                        description={t("expiredSmallCardDescription")}
                        onClick={() =>
                            router.push(
                                `${pathname}?tab=licenses&status=expired`,
                            )
                        }
                    />
                )}
            </div>

            {tenant.kind === "partner" && (
                <div className="col-span-full text-sm text-muted-foreground">
                    <sup>*</sup>
                    {t("licenseCardWarning")}
                </div>
            )}

            <div className="col-span-full">
                <h2 className="font-medium text-xl">{t("usages")}</h2>
            </div>

            {panelTenant && (
                <Tabs
                    defaultValue={
                        !panelTenant?.licensed ? "perWorkload" : "perGB"
                    }
                    className="col-span-full"
                >
                    <TabsList>
                        {!panelTenant?.licensed && (
                            <TabsTrigger value={"perWorkload"}>
                                {t("perWorkload")}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value={"perGB"}>{t("perGB")}</TabsTrigger>
                    </TabsList>
                    {!usages ? (
                        <div className="col-span-3 mt-2">
                            <Skeleton>
                                <DefaultSkeleton />
                            </Skeleton>
                        </div>
                    ) : (
                        <>
                            <TabsContent value={"perWorkload"}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 min-h-24">
                                    {usagesPerWorkload?.length ? (
                                        usagesPerWorkload
                                            ?.sort((a, b) =>
                                                a.usage_name < b.usage_name
                                                    ? 1
                                                    : b.usage_name <
                                                      a.usage_name
                                                    ? -1
                                                    : 0,
                                            )
                                            .map((u: TenantUsage, index) => (
                                                <UsageCard
                                                    key={index}
                                                    title={u.name}
                                                    description={u.usage_name}
                                                    unit={u.measurement_unit}
                                                    value={u.value}
                                                    quota={
                                                        u.offering_item
                                                            ?.quota as any
                                                    }
                                                />
                                            ))
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-center col-span-full">
                                                <p>{t("noUsageData")}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value={"perGB"}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 min-h-24">
                                    {usagesPerGB?.length ? (
                                        usagesPerGB
                                            ?.sort((a, b) =>
                                                a.usage_name < b.usage_name
                                                    ? 1
                                                    : b.usage_name <
                                                      a.usage_name
                                                    ? -1
                                                    : 0,
                                            )
                                            .map((u: TenantUsage, index) => (
                                                <UsageCard
                                                    key={index}
                                                    title={u.name}
                                                    description={u.usage_name}
                                                    unit={u.measurement_unit}
                                                    value={u.value}
                                                    quota={
                                                        u.offering_item
                                                            ?.quota as any
                                                    }
                                                />
                                            ))
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-center col-span-full">
                                                <p>{t("noUsageData")}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            )}
        </div>
    );
}
