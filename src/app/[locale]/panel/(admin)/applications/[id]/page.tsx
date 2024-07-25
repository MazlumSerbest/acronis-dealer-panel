"use client";
import useRouter from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { DateTimeFormat } from "@/utils/date";
import { cities } from "@/lib/constants";

export default function ApplicationDetail({
    params,
}: {
    params: { id: string };
}) {
    const t = useTranslations("General");

    const { data, error } = useSWR(`/api/application/${params.id}`);

    const citiesList: ListBoxItem[] = cities.map((city) => {
        return {
            id: city.code,
            name: city.name,
        };
    });

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <Card className="w-full">
            <CardHeader className="py-4">
                <CardTitle className="font-medium text-xl">
                    {t("applicationInformation")}
                </CardTitle>
                {/* <CardDescription>Card Description</CardDescription> */}
            </CardHeader>

            <CardContent className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                <div>
                    <dt className="font-medium">{t("applicationDate")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {DateTimeFormat(data.applicationDate) || "-"}
                    </dd>
                </div>
                {data.approvedAt ? (
                    <div>
                        <dt className="font-medium">{t("approvedAt")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {DateTimeFormat(data.approvedAt) || "-"}
                        </dd>
                    </div>
                ) : null}
                {data.approvedBy ? (
                    <div>
                        <dt className="font-medium">{t("approvedBy")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.approvedBy || "-"}
                        </dd>
                    </div>
                ) : null}
                {/* {data.partner ? (
                    <div>
                        <dt className="font-medium">{t("partner")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.partner.name || "-"}
                        </dd>
                    </div>
                ) : null} */}
                <div>
                    <dt className="font-medium">{t("companyType")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {t(data.companyType) || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("companyName")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.name || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("taxNo")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.taxNo || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("taxOffice")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.taxOffice || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("email")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.email || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("mobile")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data?.mobile ? "+90" + data.phone : "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("phone")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data?.phone ? "+90" + data.phone : "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("address")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.address || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("city")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {citiesList.find((c) => c.id == data.city)?.name || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("district")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.district || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">{t("postalCode")}</dt>
                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                        {data.postalCode || "-"}
                    </dd>
                </div>
            </CardContent>
        </Card>
    );
}
