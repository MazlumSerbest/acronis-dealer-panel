import useSWR from "swr";
import { DateTimeFormat } from "@/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatBytes } from "@/utils/functions";
import NeedleChart from "@/components/charts/Needle";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function GeneralTab(props: Props) {
    const { t, tenant } = props;

    const { data, error } = useSWR(`/api/acronis/usages/${tenant?.id}`, null, {
        onSuccess: (data) => {
            console.log(data.usages.items.map((u: TenantUsage) => u.edition));
        },
    });

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle>
                            <h2 className="flex-none font-medium text-lg text-zinc-600">
                                Tenant Information
                            </h2>
                        </CardTitle>
                        {/* <CardDescription>Card Description</CardDescription> */}
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-col divide-y text-zinc-500 text-sm leading-6 p-2 md:px-5">
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                            <dt className="font-medium">{t("id")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {tenant?.id || "-"}
                            </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                            <dt className="font-medium">{t("kind")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {t(tenant?.kind || "")}
                            </dd>
                        </div>

                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                            <dt className="font-medium">{t("customerType")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {tenant?.customer_type || "-"}
                            </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                            <dt className="font-medium">{t("email")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {tenant?.contact?.email || "-"}
                            </dd>
                        </div>

                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                            <dt className="font-medium">{t("createdAt")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {DateTimeFormat(tenant?.created_at || "")}
                            </dd>
                        </div>
                        {/* <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">
                            {t("currency")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.pricing.currency || "-"}
                        </dd>
                    </div> */}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 w-full gap-2">
                <Card className="w-full">
                    <CardHeader className="py-4">
                        <CardTitle>
                            <h2 className="flex-none font-medium text-lg text-center text-zinc-600">
                                Backup Storage
                            </h2>
                        </CardTitle>
                    </CardHeader>
                    <Separator />
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
                                ).offering_item.quota.value
                            }
                        />
                        <p className="text-center text-zinc-600">
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
                                    )?.offering_item.quota.value,
                                )}
                            </span>
                        </p>
                    </CardContent>
                </Card>
                {/* <Card className="w-fit">
                    <CardHeader className="py-4">
                        <CardTitle>
                            <h2 className="flex-none font-medium text-lg text-center text-zinc-600">
                                Usages
                            </h2>
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

            {!data ? (
                <></>
            ) : (
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle>
                                <h2 className="flex-none font-medium text-lg text-zinc-600">
                                    Usages Per Workload
                                </h2>
                            </CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-6">
                            <div className="flex flex-col font-light text-zinc-600">
                                {data.usages.items
                                    .filter(
                                        (u: TenantUsage) =>
                                            u.edition == "pck_per_workload",
                                    )
                                    .map((u: TenantUsage) => (
                                        <p key={u.usage_name}>
                                            {u.usage_name} -{" "}
                                            {`${
                                                u.measurement_unit == "bytes"
                                                    ? formatBytes(u.value)
                                                    : u.value
                                            }${
                                                u.offering_item
                                                    ? " / " +
                                                      (u.offering_item?.quota
                                                          ?.value == null
                                                          ? "Unlimited"
                                                          : u.measurement_unit ==
                                                            "bytes"
                                                          ? formatBytes(
                                                                u.offering_item
                                                                    ?.quota
                                                                    ?.value,
                                                            )
                                                          : u.value)
                                                    : ""
                                            }`}
                                        </p>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle>
                                <h2 className="flex-none font-medium text-lg text-zinc-600">
                                    Usages Per Gigabyte
                                </h2>
                            </CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-6">
                            <div className="flex flex-col font-light text-zinc-600">
                                {data.usages.items
                                    .filter(
                                        (u: TenantUsage) =>
                                            u.edition == "pck_per_gigabyte",
                                    )
                                    .map((u: TenantUsage) => (
                                        <p key={u.usage_name}>
                                            {u.usage_name} -{" "}
                                            {`${
                                                u.measurement_unit == "bytes"
                                                    ? formatBytes(u.value)
                                                    : u.value
                                            }${
                                                u.offering_item
                                                    ? " / " +
                                                      (u.offering_item?.quota
                                                          ?.value == null
                                                          ? "Unlimited"
                                                          : u.measurement_unit ==
                                                            "bytes"
                                                          ? formatBytes(
                                                                u.offering_item
                                                                    ?.quota
                                                                    ?.value,
                                                            )
                                                          : u.value)
                                                    : ""
                                            }`}
                                        </p>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
