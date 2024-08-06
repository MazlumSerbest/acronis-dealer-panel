import { useEffect, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";
import NeedleChart from "@/components/charts/Needle";
import { formatBytes } from "@/utils/functions";
import { DateFormat, DateTimeFormat } from "@/utils/date";
import { cn } from "@/lib/utils";
import { LuAlertTriangle, LuCalendar, LuPencil } from "react-icons/lu";
import useUserStore from "@/store/user";

type Props = {
    t: Function;
    tenant: Tenant;
};

const clientFormSchema = z.object({
    billingDate: z.date().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function GeneralTab(props: Props) {
    const { t, tenant } = props;
    const { toast } = useToast();
    const { user } = useUserStore();
    const [openPartnerDialog, setOpenPartnerDialog] = useState(false);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [edit, setEdit] = useState(false);
    const [daysUntilNextBillingDate, seDaysUntilNextBillingDate] = useState(0);

    const {
        data: partner,
        error: partnerError,
        mutate: partnerMutate,
    } = useSWR(`/api/partner/${tenant?.id}`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            console.log(tenant);
            // const today = new Date();
            // const currentYear = today.getFullYear();
            // const billingDate = new Date(data.billingDate);

            // // Create an anniversary date for this year
            // let nextBillingDate = new Date(
            //     currentYear,
            //     billingDate.getMonth(),
            //     billingDate.getDate(),
            // );

            // // If today's date is past this year's anniversary, use the next year's anniversary
            // if (today > nextBillingDate) {
            //     nextBillingDate.setFullYear(currentYear + 1);
            // }

            // // Calculate the difference in time (in milliseconds)
            // const timeDiff = nextBillingDate.getTime() - today.getTime();

            // // Convert the difference from milliseconds to days
            // const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            // return seDaysUntilNextBillingDate(daysDiff);
        },
    });

    const {
        data: usages,
        error: usagesError,
        mutate: usagesMutate,
    } = useSWR(`/api/acronis/usages/${tenant?.id}`, null, {
        revalidateOnFocus: false,
    });

    //#region Form
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
    });

    async function onSubmit(values: ClientFormValues) {
        // const newClient = {
        //     acronisId: tenant?.id,
        //     billingDate: values.billingDate?.toISOString(),
        //     partnerId: user?.partnerId,
        // };
        // const existingClient = {
        //     billingDate: values.billingDate?.toISOString(),
        // };
        // if (client)
        //     fetch(`/api/client/${tenant?.id}`, {
        //         method: "PUT",
        //         body: JSON.stringify(existingClient),
        //     })
        //         .then((res) => res.json())
        //         .then((res) => {
        //             if (res.ok) {
        //                 toast({
        //                     description: res.message,
        //                 });
        //                 clientMutate();
        //                 setEdit(false);
        //             } else {
        //                 toast({
        //                     variant: "destructive",
        //                     title: t("errorTitle"),
        //                     description: res.message,
        //                 });
        //             }
        //         });
        // else
        //     fetch(`/api/client`, {
        //         method: "POST",
        //         body: JSON.stringify(newClient),
        //     })
        //         .then((res) => res.json())
        //         .then((res) => {
        //             if (res.ok) {
        //                 toast({
        //                     description: res.message,
        //                 });
        //                 clientMutate();
        //                 setEdit(false);
        //             } else {
        //                 toast({
        //                     variant: "destructive",
        //                     title: t("errorTitle"),
        //                     description: res.message,
        //                 });
        //             }
        //         });
    }
    //#endregion

    return (
        <div className="grid grid-cols-3 gap-4">
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
                            {/* <Button
                                disabled={edit}
                                size="sm"
                                className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                                onClick={() => {
                                    form.reset(client);
                                    setEdit(true);
                                }}
                            >
                                <span className="sr-only lg:not-sr-only">
                                    {t("edit")}
                                </span>
                                <LuPencil className="size-4" />
                            </Button> */}
                        </CardTitle>
                        {/* <CardDescription>Card Description</CardDescription> */}
                    </CardHeader>
                    {/* <Separator /> */}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:items-center *:px-4 *:py-2">
                                <div>
                                    <dt className="font-medium">{t("kind")}</dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {t(tenant?.kind || "")}
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
                                        {t("customerType")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {tenant?.customer_type || "-"}
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

                                {/* <div>
                                    <dt className="font-medium">
                                        {t("billingDate")}
                                    </dt>
                                    {edit ? (
                                        <FormField
                                            control={form.control}
                                            name="billingDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={
                                                                        "outline"
                                                                    }
                                                                    className={cn(
                                                                        "w-[240px] pl-3 text-left font-normal",
                                                                        !field.value &&
                                                                            "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        DateFormat(
                                                                            field?.value?.toString(),
                                                                        )
                                                                    ) : (
                                                                        <span>
                                                                            {t(
                                                                                "selectDate",
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <LuCalendar className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    field.value
                                                                }
                                                                onSelect={
                                                                    field.onChange
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                            {`${DateFormat(
                                                client?.billingDate || "",
                                            )} ${
                                                daysUntilNextBillingDate
                                                    ? t(
                                                          "daysUntilNextBillingDate",
                                                          {
                                                              days: daysUntilNextBillingDate,
                                                          },
                                                      )
                                                    : ""
                                            }`}
                                        </dd>
                                    )}
                                </div> */}

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
                        tenant.kind == "partner" &&
                        (!partner || !partner?.users?.length) && (
                            <CardFooter className="flex flex-row justify-end">
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
                                                        fetch(`/api/user`, {
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
                                                        })
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
                                {!partner && (
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
                                                        fetch(`/api/partner`, {
                                                            method: "POST",
                                                            body: JSON.stringify(
                                                                {
                                                                    acronisId:
                                                                        tenant?.id,
                                                                    name: tenant?.name,
                                                                    email: tenant
                                                                        ?.contact
                                                                        ?.email,
                                                                    phone: tenant
                                                                        ?.contact
                                                                        ?.phone,
                                                                },
                                                            ),
                                                        })
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
                <div className="grid grid-cols-1 w-full gap-2 col-span-3 md:col-span-1">
                    <Card className="w-full">
                        <CardHeader className="py-4">
                            <CardTitle className="font-medium text-xl">
                                Backup Storage
                            </CardTitle>
                        </CardHeader>
                        {/* <Separator /> */}
                        <CardContent className="flex flex-col p-6 place-items-center">
                            <NeedleChart
                                value={
                                    usages?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    )?.value
                                }
                                total={
                                    usages?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    )?.offering_item.quota?.value
                                }
                            />
                            <p className="text-center">
                                {formatBytes(
                                    usages?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    )?.value,
                                )}
                                <span className="text-zinc-400">
                                    {" / "}
                                    {formatBytes(
                                        usages?.usages?.items?.find(
                                            (u: TenantUsage) =>
                                                u.usage_name == "storage" &&
                                                u.edition == "pck_per_workload",
                                        )?.offering_item?.quota?.value || 0,
                                    )}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                    {/* <Card className="w-fit">
                    <CardHeader className="py-4">
                            <CardTitle className="font-medium text-xl">
                                Usages
                        </CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-6">
                        <NeedleChart
                            value={data?.usages?.items?.[1].value}
                            total={
                                data?.usages?.items?.[1].offering_item.quota
                                    .value
                            }
                        />
                    </CardContent>
                </Card> */}
                </div>
            )}

            {!usages ? (
                <div className="col-span-3">
                    <Skeleton>
                        <DefaultSkeleton />
                    </Skeleton>
                </div>
            ) : (
                <Card className="col-span-3">
                    <CardHeader className="py-4">
                        <CardTitle className="font-medium text-xl">
                            Usages
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 divide-x *:px-4">
                        <div>
                            <h2 className="flex-none font-medium text-lg text-center">
                                Per Workload
                            </h2>
                            <div className="flex flex-col font-light divide-y">
                                {usages?.usages?.items
                                    ?.filter(
                                        (u: TenantUsage) =>
                                            u.edition == "pck_per_workload",
                                    )
                                    .map((u: TenantUsage) => (
                                        <div className="p-2" key={u.usage_name}>
                                            <p className="font-medium">
                                                {u.name} ({u.usage_name}) :
                                            </p>
                                            <p>
                                                <span
                                                    className={cn(
                                                        u.offering_item?.quota
                                                            ?.value !==
                                                            undefined &&
                                                            u.offering_item
                                                                ?.quota
                                                                ?.value !==
                                                                null &&
                                                            u.value >
                                                                u.offering_item
                                                                    ?.quota
                                                                    ?.value
                                                            ? "text-red-600"
                                                            : u.offering_item
                                                                  ?.quota
                                                                  ?.value !==
                                                                  undefined &&
                                                              u.offering_item
                                                                  ?.quota
                                                                  ?.value !==
                                                                  null &&
                                                              u.value >=
                                                                  u
                                                                      .offering_item
                                                                      ?.quota
                                                                      ?.value *
                                                                      0.7
                                                            ? "text-yellow-500"
                                                            : "",
                                                    )}
                                                >
                                                    {u.measurement_unit ==
                                                    "bytes"
                                                        ? formatBytes(u.value)
                                                        : u.value}
                                                </span>
                                                {u.offering_item?.quota
                                                    ?.value != undefined &&
                                                u.offering_item.quota.value !=
                                                    null ? (
                                                    <span className="text-zinc-400">
                                                        {` / ${
                                                            u.offering_item
                                                                ?.quota
                                                                ?.value == null
                                                                ? "Unlimited"
                                                                : u.measurement_unit ==
                                                                  "bytes"
                                                                ? formatBytes(
                                                                      u
                                                                          .offering_item
                                                                          ?.quota
                                                                          ?.value,
                                                                  )
                                                                : u.value
                                                        }`}
                                                    </span>
                                                ) : null}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="flex-none font-medium text-lg text-center">
                                Per Gigabyte
                            </h2>
                            <div className="flex flex-col font-light divide-y">
                                {usages?.usages?.items
                                    ?.filter(
                                        (u: TenantUsage) =>
                                            u.edition == "pck_per_gigabyte",
                                    )
                                    .map((u: TenantUsage) => (
                                        <div className="p-2" key={u.usage_name}>
                                            <p className="font-medium">
                                                {u.name} ({u.usage_name}) :
                                            </p>
                                            <p>
                                                <span
                                                    className={cn(
                                                        u.offering_item?.quota
                                                            ?.value !==
                                                            undefined &&
                                                            u.offering_item
                                                                ?.quota
                                                                ?.value !==
                                                                null &&
                                                            u.value >
                                                                u.offering_item
                                                                    ?.quota
                                                                    ?.value
                                                            ? "text-red-600"
                                                            : u.offering_item
                                                                  ?.quota
                                                                  ?.value !==
                                                                  undefined &&
                                                              u.offering_item
                                                                  ?.quota
                                                                  ?.value !==
                                                                  null &&
                                                              u.value >=
                                                                  u
                                                                      .offering_item
                                                                      ?.quota
                                                                      ?.value *
                                                                      0.7
                                                            ? "text-yellow-500"
                                                            : "",
                                                    )}
                                                >
                                                    {u.measurement_unit ==
                                                    "bytes"
                                                        ? formatBytes(u.value)
                                                        : u.value}
                                                </span>
                                                <span className="text-zinc-400">
                                                    {u.offering_item?.quota
                                                        ?.value != undefined &&
                                                        u.offering_item.quota
                                                            .value != null && (
                                                            <span className="text-zinc-400">
                                                                {` / ${
                                                                    u
                                                                        .offering_item
                                                                        ?.quota
                                                                        ?.value ==
                                                                    null
                                                                        ? "Unlimited"
                                                                        : u.measurement_unit ==
                                                                          "bytes"
                                                                        ? formatBytes(
                                                                              u
                                                                                  .offering_item
                                                                                  ?.quota
                                                                                  ?.value,
                                                                          )
                                                                        : u.value
                                                                }`}
                                                            </span>
                                                        )}
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
