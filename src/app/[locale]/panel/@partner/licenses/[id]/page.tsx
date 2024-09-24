"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Loader from "@/components/loaders/Loader";
import { Button } from "@/components/ui/button";

import Partials from "./Partials";
import { DateFormat } from "@/utils/date";

export default function PartialLicenseDetail({
    params,
}: {
    params: { id: string };
}) {
    const t = useTranslations("General");

    const { data, error, isLoading, mutate } = useSWR(
        `/api/license/${params.id}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-medium text-xl">
                        {t("licenseDetail")}
                    </CardTitle>
                    <CardDescription>
                        {data.product.name || "-"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <div className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                        <div>
                            <dt className="font-medium">{t("productName")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.product.name || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("serialNo")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.serialNo || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("quota")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.product.quota || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("unit")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.product.unit || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("activatedAt")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {DateFormat(data.activatedAt) || "-"}
                            </dd>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-row gap-2 justify-end">
                    <Button
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => {
                            // setOpen(true);
                        }}
                    >
                        {t("setAsNotPartial")}
                    </Button>
                </CardFooter>
            </Card>

            <Partials
                licenseId={params.id}
                partials={data.partials}
                isLoading={isLoading}
                mutate={mutate}
            />
        </>
    );
}
