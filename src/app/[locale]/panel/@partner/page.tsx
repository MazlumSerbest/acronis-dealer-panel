"use client";
import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import StorageCard from "@/components/usages/Storage";
import UsageCard from "@/components/usages/Usage";

import useUserStore from "@/store/user";
import Loader from "@/components/loaders/Loader";

export default function PanelPage() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();
    
    const [usagesPerWorkload, setUsagesPerWorkload] = useState<TenantUsage[]>();
    const [usagesPerGB, setUsagesPerGB] = useState<TenantUsage[]>();

    const { data, error } = useSWR(
        `/api/acronis/usages/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                if (!currentUser?.licensed) {
                    setUsagesPerWorkload(
                        data?.usages?.items?.filter(
                            (u: TenantUsage) =>
                                u.edition == "pck_per_workload" &&
                                u.value > 0 &&
                                u.usage_name != "storage" &&
                                u.usage_name != "storage_total",
                        ),
                    );
                }
                setUsagesPerGB(
                    data?.usages?.items?.filter(
                        (u: TenantUsage) =>
                            u.edition == "pck_per_gigabyte" &&
                            u.value > 0 &&
                            u.usage_name != "storage" &&
                            u.usage_name != "storage_total",
                    ),
                );
            },
        },
    );

    return (
        <div className="w-full space-y-8 mt-4">
            {/* <h1 className="w-full text-xl text-center font-bold">
                {t("welcomeToPartner")}
            </h1> */}

            <div className="max-w-[1024px] m-auto">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 10000,
                        }),
                    ]}
                >
                    <CarouselContent>
                        <CarouselItem
                            key={1}
                            className="h-[300px] lg:basis-1/2"
                        >
                            <AspectRatio ratio={16 / 9}>
                                <Image
                                    src="/images/carousel/slide-1.png"
                                    className="rounded-xl object-cover"
                                    fill
                                    alt="Slide 1"
                                />
                            </AspectRatio>
                        </CarouselItem>
                        <CarouselItem
                            key={2}
                            className="h-[300px] lg:basis-1/2"
                        >
                            <AspectRatio ratio={16 / 9}>
                                <Image
                                    src="/images/carousel/slide-2.png"
                                    className="rounded-xl object-cover"
                                    fill
                                    alt="Slide 2"
                                />
                            </AspectRatio>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>

            {!data && !error ? (
                <div className="h-80">
                    <Loader />
                </div>
            ) : error ? (
                <div>{t("failedToLoad")}</div>
            ) : (
                <div className="container m-auto flex flex-col gap-4">
                    <h1 className="text-xl font-semibold">
                        {t("totalUsages")}
                    </h1>

                    <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!currentUser?.licensed && (
                            <StorageCard
                                title={t("storageCardTitle")}
                                description={t("storageCardDescriptionPW")}
                                model={t("perWorkload")}
                                usage={
                                    data?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    )?.value
                                }
                                quota={
                                    data?.usages?.items?.find(
                                        (u: TenantUsage) =>
                                            u.usage_name == "storage" &&
                                            u.edition == "pck_per_workload",
                                    )?.offering_item.quota
                                }
                            />
                        )}

                        <StorageCard
                            title={t("storageCardTitle")}
                            description={
                                !currentUser?.licensed
                                    ? t("storageCardDescriptionGB")
                                    : t("storageCardDescription")
                            }
                            model={!currentUser?.licensed ? t("perGB") : t("total")}
                            usage={
                                data?.usages?.items?.find(
                                    (u: TenantUsage) =>
                                        u.usage_name == "storage" &&
                                        u.edition == "pck_per_gigabyte",
                                )?.value
                            }
                            quota={
                                data?.usages?.items?.find(
                                    (u: TenantUsage) =>
                                        u.usage_name == "storage" &&
                                        u.edition == "pck_per_gigabyte",
                                )?.offering_item.quota
                            }
                        />
                    </div>

                    {!currentUser?.licensed ? (
                        <Tabs
                            defaultValue="perWorkload"
                            className="flex flex-col w-full mt-4"
                        >
                            <TabsList className="mx-auto">
                                <TabsTrigger value={"perWorkload"}>
                                    {t("perWorkload")}
                                </TabsTrigger>
                                <TabsTrigger value={"perGB"}>
                                    {t("perGB")}
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="perWorkload">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 min-h-24">
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
                            <TabsContent value="perGB">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 min-h-24">
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
                        </Tabs>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 min-h-24">
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
                                                u.offering_item?.quota as any
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
                    )}
                </div>
            )}
        </div>
    );
}
