"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

import StorageCard from "@/components/cards/Storage";
import UsageCard from "@/components/cards/Usage";

import useUserStore from "@/store/user";
import SmallCard from "@/components/cards/SmallCard";
import { LuShield, LuShieldCheck, LuShieldQuestion, LuSigma } from "react-icons/lu";

export default function PanelPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();

    const [totalLicenseCount, setTotalLicenseCount] = useState<number>(0);
    const [unassignedLicenseCount, setUnassignedLicenseCount] =
        useState<number>(0);
    const [assignedLicenseCount, setAssignedLicenseCount] = useState<number>(0);
    const [activeLicenseCount, setActiveLicenseCount] = useState<number>(0);

    const [usagesPerWorkload, setUsagesPerWorkload] = useState<TenantUsage[]>();
    const [usagesPerGB, setUsagesPerGB] = useState<TenantUsage[]>();

    const { data, error } = useSWR(
        currentUser?.acronisTenantId &&
            `/api/acronis/usages/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: async (data) => {
                setUsagesPerWorkload(
                    data?.usages?.items?.filter(
                        (u: TenantUsage) =>
                            u.edition == "pck_per_workload" &&
                            u.value > 0 &&
                            u.usage_name != "storage" &&
                            u.usage_name != "storage_total",
                    ),
                );
                setUsagesPerGB(
                    data?.usages?.items?.filter(
                        (u: TenantUsage) =>
                            u.edition == "pck_per_gigabyte" &&
                            u.value > 0 &&
                            u.usage_name != "storage" &&
                            u.usage_name != "storage_total",
                    ),
                );

                const assigned = await fetch(
                    `/api/admin/license/count?status=assigned`,
                );
                const assignedCount = await assigned.json();
                setAssignedLicenseCount(assignedCount.count);

                const unassigned = await fetch(
                    `/api/admin/license/count?status=unassigned`,
                );
                const unassignedCount = await unassigned.json();
                setUnassignedLicenseCount(unassignedCount.count);

                const active = await fetch(
                    `/api/admin/license/count?status=active`,
                );
                console.log(active);
                const activeCount = await active.json();
                setActiveLicenseCount(activeCount.count);

                setTotalLicenseCount(
                    activeCount.count +
                        assignedCount.count +
                        unassignedCount.count,
                );
            },
        },
    );

    return (
        <div className="w-full space-y-8 mt-4">
            {/* <h1 className="w-full text-xl text-center font-bold">
                {t("welcomeToAdmin")}
            </h1> */}

            <div className="container px-12">
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
                            className="flex items-center min-h-[200px] md:basis-1/2"
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
                            className="flex items-center min-h-[200px] md:basis-1/2"
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

            {error ? (
                <div>{t("failedToLoad")}</div>
            ) : (
                <div className="container m-auto flex flex-col gap-4">
                    <h1 className="text-xl font-semibold">{t("licenses")}</h1>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <SmallCard
                            title={t("total")}
                            value={totalLicenseCount}
                            icon={
                                <LuSigma className="size-5 text-muted-foreground" />
                            }
                            description={t("totalSmallCardDescription")}
                            onClick={() => router.push("panel/licenses")}
                        />
                        <SmallCard
                            title={t("unassigned")}
                            value={unassignedLicenseCount}
                            icon={
                                <LuShieldQuestion className="size-5 text-muted-foreground" />
                            }
                            description={t("unassignedSmallCardDescription")}
                            onClick={() => router.push("panel/licenses")}
                        />
                        <SmallCard
                            title={t("assigned")}
                            value={assignedLicenseCount}
                            icon={
                                <LuShield className="size-5 text-muted-foreground" />
                            }
                            description={t("assignedSmallCardDescription")}
                            onClick={() => router.push("panel/licenses?tab=assigned&status=assigned")}
                        />
                        <SmallCard
                            title={t("active")}
                            value={activeLicenseCount}
                            icon={
                                <LuShieldCheck className="size-5 text-muted-foreground" />
                            }
                            description={t("activeSmallCardDescription")}
                            onClick={() => router.push("panel/licenses?tab=assigned&status=active")}
                        />
                    </div>

                    <h1 className="text-xl font-semibold mt-4">
                        {t("totalUsages")}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <StorageCard
                            title={t("storageCardTitle")}
                            description={t("storageCardDescriptionGB")}
                            model={t("perGB")}
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
                                        <div className="flex items-center justify-center col-span-full">
                                            <p>{t("noUsageData")}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
