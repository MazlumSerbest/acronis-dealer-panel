import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import NeedleChart from "@/components/charts/Needle";
import { formatBytes } from "@/utils/functions";
import { DateTimeFormat } from "@/utils/date";
import { cn } from "@/lib/utils";
import { LuAlertTriangle } from "react-icons/lu";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function GeneralTab(props: Props) {
    const { t, tenant } = props;

    const { data, error } = useSWR(`/api/acronis/usages/${tenant?.id}`);

    return (
        <div className="grid grid-cols-3 gap-4">
            {data?.usages?.items?.some(
                (u: TenantUsage) =>
                    u.offering_item?.quota?.value !== null &&
                    u.offering_item?.quota?.value !== undefined &&
                    u.value > u.offering_item.quota.value,
            ) ? (
                <Alert className="col-span-3" variant="destructive">
                    <LuAlertTriangle className="size-4" />
                    <AlertTitle>Limit Exceeded</AlertTitle>
                    <AlertDescription>
                        Some of this clients usages are exceeding the quota
                        limit.
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="col-span-2">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle>
                            <h2 className="flex-none font-medium text-xl">
                                Client Information
                            </h2>
                        </CardTitle>
                        {/* <CardDescription>Card Description</CardDescription> */}
                    </CardHeader>
                    {/* <Separator /> */}
                    <CardContent className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                        <div>
                            <dt className="font-medium">{t("id")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {tenant?.id || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("kind")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {t(tenant?.kind || "")}
                            </dd>
                        </div>

                        <div>
                            <dt className="font-medium">{t("customerType")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {tenant?.customer_type || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("email")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {tenant?.contact?.email || "-"}
                            </dd>
                        </div>

                        <div>
                            <dt className="font-medium">{t("createdAt")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {DateTimeFormat(tenant?.created_at || "")}
                            </dd>
                        </div>
                        {/* <div>
                        <dt className="font-medium">
                            {t("currency")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light mt-1 sm:mt-0">
                            {data.tenantInfo.pricing.currency || "-"}
                        </dd>
                    </div> */}
                    </CardContent>
                </Card>
            </div>

            {!data ? (
                <Skeleton>
                    <div className="h-full w-full rounded-xl bg-slate-200"></div>
                </Skeleton>
            ) : (
                <div className="grid grid-cols-1 w-full gap-2">
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
                                    data?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    ).value
                                }
                                total={
                                    data?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    ).offering_item.quota?.value
                                }
                            />
                            <p className="text-center">
                                {formatBytes(
                                    data?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    ).value,
                                )}
                                <span className="text-zinc-400">
                                    {" / "}
                                    {formatBytes(
                                        data?.usages?.items?.find(
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

            {!data ? (
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
                                {data?.usages?.items
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
                                {data?.usages?.items
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
                                                        .value != null ? (
                                                        <span className="text-zinc-400">
                                                            {` / ${
                                                                u.offering_item
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
                                                    ) : null}
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
