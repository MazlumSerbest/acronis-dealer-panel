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

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import DatePicker from "@/components/DatePicker";
import StorageCard from "@/components/usages/Storage";
import UsageCard from "@/components/usages/Usage";

import { calculateRemainingDays, formatBytes } from "@/utils/functions";
import { DateFormat, DateTimeFormat } from "@/utils/date";
import { cn } from "@/lib/utils";
import { LuAlertTriangle, LuArrowUpRight, LuPencil } from "react-icons/lu";
import useUserStore from "@/store/user";

type Props = {
    t: Function;
    tenant: Tenant;
};

const partnerFormSchema = z.object({
    billingDate: z.date().optional(),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function GeneralTab({ t, tenant }: Props) {
    const { toast } = useToast();
    const { user: currentUser } = useUserStore();
    const [openPartnerDialog, setOpenPartnerDialog] = useState(false);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [edit, setEdit] = useState(false);
    const [daysUntilNextBillingDate, seDaysUntilNextBillingDate] = useState(0);
    const [usagesPerGB, setUsagesPerGB] = useState<TenantUsage[]>();
    const [usagesPerWorkload, setUsagesPerWorkload] = useState<TenantUsage[]>();

    const {
        data: partner,
        error: partnerError,
        mutate: partnerMutate,
    } = useSWR(`/api/admin/partner/${tenant?.id}`, null, {
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
        onSuccess: (data) => {
            setUsagesPerGB(
                data?.usages?.items?.filter(
                    (u: TenantUsage) =>
                        u.edition == "pck_per_gigabyte" &&
                        u.value > 0 &&
                        u.usage_name != "storage" &&
                        u.usage_name != "storage_total",
                ),
            );
            setUsagesPerWorkload(
                data?.usages?.items?.filter(
                    (u: TenantUsage) =>
                        u.edition == "pck_per_workload" &&
                        u.value > 0 &&
                        u.usage_name != "storage" &&
                        u.usage_name != "storage_total",
                ),
            );
        },
    });

    //#region Form
    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
    });

    async function onSubmit(values: PartnerFormValues) {
        const existingPartner = {
            name: tenant?.name,
            billingDate: values.billingDate?.toISOString(),
        };
        if (partner)
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
                        partnerMutate();
                        setEdit(false);
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
                    <AlertTitle>Limit Exceeded</AlertTitle>
                    <AlertDescription>
                        Some of this clients usages are exceeding the quota
                        limit.
                    </AlertDescription>
                </Alert>
            )}

            <div className="col-span-3 md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row justify-between">
                            <h2 className="flex-none font-medium text-xl">
                                Tenant Information
                            </h2>

                            {partner &&
                                partner.parentAcronisId ==
                                    currentUser?.acronisTenantId && (
                                    <Button
                                        disabled={edit}
                                        size="sm"
                                        className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                                        onClick={() => {
                                            form.reset(partner);
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
                            // <CardDescription>
                            //     Some information only can be changed from the
                            //     Acronis Cloud Platform
                            // </CardDescription>
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
                        {/* <CardDescription>Card Description</CardDescription> */}
                    </CardHeader>
                    {/* <Separator /> */}

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
                                            {partner?.billingDate
                                                ? `${DateFormat(
                                                      partner?.billingDate,
                                                  )} ${
                                                      daysUntilNextBillingDate >
                                                      0
                                                          ? t(
                                                                "daysUntilNextBillingDate",
                                                                {
                                                                    days: daysUntilNextBillingDate,
                                                                },
                                                            )
                                                          : t(
                                                                "billingDatePassed",
                                                            )
                                                  }`
                                                : "-"}
                                        </dd>
                                    )}
                                </div>

                                {/* <div>
                                    <dt className="font-medium">
                                        {t("createdAt")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {DateTimeFormat(
                                            tenant?.created_at || "",
                                        )}
                                    </dd>
                                </div> */}

                                {tenant.kind == "partner" && (
                                    <>
                                        <div>
                                            <dt className="font-medium">
                                                {t("panelPartner")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                                <BoolChip value={!!partner} />
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="font-medium">
                                                {t("panelUser")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                                <BoolChip
                                                    value={
                                                        partner?.users?.length
                                                    }
                                                />
                                            </dd>
                                        </div>
                                    </>
                                )}

                                {/* <div>
                        <dt className="font-medium">
                            {t("currency")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light mt-1 sm:mt-0">
                            {data.tenantInfo.pricing.currency || "-"}
                        </dd>
                    </div> */}
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
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-600/90"
                                    >
                                        {t("save")}
                                    </Button>
                                </CardFooter>
                            )}
                        </form>
                    </Form>
                    {!edit &&
                        tenant.parent_id == currentUser?.acronisTenantId &&
                        (!partner || partner?.users?.length == 0) && (
                            <CardFooter className="flex flex-row justify-end gap-2">
                                {/* <Button
                                variant="link"
                                size="default"
                                className="p-0 text-blue-400"
                                asChild
                            >
                                <Link
                                    target="_blank"
                                    href={`https://tr01-cloud.acronis.com/mc/app;group_id=${tenant?.parent_id}/clients;focused_tenant_uuid=${tenant?.id}`}
                                >
                                    {t("showOnAcronis")}
                                    <LuArrowUpRight className="ml-2 size-4" />
                                </Link>
                            </Button> */}

                                {partner && !partner?.users?.length && (
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
                                                    className="bg-blue-400 hover:bg-blue-400/90"
                                                    onClick={() => {
                                                        fetch(
                                                            `/api/admin/user`,
                                                            {
                                                                method: "POST",
                                                                body: JSON.stringify(
                                                                    {
                                                                        partnerId:
                                                                            partner?.id,
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
                                                                    partnerMutate();
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
                                                            });
                                                    }}
                                                >
                                                    {t("create")}
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                                {!partner && tenant.kind == "partner" && (
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
                                            <AlertDialogFooter>
                                                <AlertDialogCancel asChild>
                                                    <Button variant="outline">
                                                        {t("cancel")}
                                                    </Button>
                                                </AlertDialogCancel>
                                                <Button
                                                    className="bg-blue-400 hover:bg-blue-400/90"
                                                    onClick={() => {
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
                                                                    partnerMutate();
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
                                                            });
                                                    }}
                                                >
                                                    {t("create")}
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
                <div className="flex flex-col grid-cols-1 w-full col-span-3 gap-4 justify-between md:col-span-1">
                    <StorageCard
                        title="Backup Storage"
                        description="Shows the storage usage per workload"
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
                    <StorageCard
                        title="Backup Storage"
                        description="Shows the storage usage per gigabyte"
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
                </div>
            )}

            <div className="col-span-3">
                <h2 className="font-medium text-xl">{t("usages")}</h2>
            </div>

            <Tabs defaultValue="perWorkload" className="col-span-3">
                <TabsList>
                    <TabsTrigger value={"perWorkload"}>
                        {t("perWorkload")}
                    </TabsTrigger>
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
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 min-h-24">
                                {usagesPerWorkload?.length ? (
                                    usagesPerWorkload
                                        ?.sort((a, b) =>
                                            a.usage_name < b.usage_name
                                                ? 1
                                                : b.usage_name < a.usage_name
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
                                        <div className="flex items-center justify-center col-span-4">
                                            <p>
                                                No usage data available for this
                                                tenant.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value={"perGB"}>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 min-h-24">
                                {usagesPerGB?.length ? (
                                    usagesPerGB
                                        ?.sort((a, b) =>
                                            a.usage_name < b.usage_name
                                                ? 1
                                                : b.usage_name < a.usage_name
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
                                        <div className="flex items-center justify-center col-span-4">
                                            <p>
                                                No usage data available for this
                                                tenant.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
