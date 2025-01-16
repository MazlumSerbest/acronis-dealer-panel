"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
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
import {
    LuShield,
    LuShieldAlert,
    LuShieldCheck,
    LuShieldOff,
} from "react-icons/lu";

export default function PanelPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();

    const [usagesPerWorkload, setUsagesPerWorkload] = useState<TenantUsage[]>();
    const [storagePerWorkload, setStoragePerWorkload] = useState<TenantUsage>();
    const [usagesPerGB, setUsagesPerGB] = useState<TenantUsage[]>();
    const [storagePerGB, setStoragePerGB] = useState<TenantUsage>();
    const [localStorage, setLocalStorage] = useState<TenantUsage>();

    const [selectedModel, setSelectedModel] = useState<string>("perWorkload");

    const [inactiveLicenseCount, setInactiveLicenseCount] = useState<number>(0);
    const [activeLicenseCount, setActiveLicenseCount] = useState<number>(0);
    const [completedLicenseCount, setCompletedLicenseCount] =
        useState<number>(0);
    const [expiredLicenseCount, setExpiredLicenseCount] = useState<number>(0);

    const { error, trigger } = useSWRMutation(
        `/api/acronis/tenants/${currentUser?.partnerAcronisId}/usages`,
        async (url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch usages");
            return response.json();
        },
        {
            onSuccess: async (data) => {
                if (!currentUser?.licensed) {
                    setUsagesPerWorkload(
                        data?.items?.filter(
                            (u: TenantUsage) =>
                                u.edition == "pck_per_workload" &&
                                u.value > 0 &&
                                u.usage_name != "storage" &&
                                u.usage_name != "storage_total",
                        ),
                    );
                }
                setUsagesPerGB(
                    data?.items?.filter(
                        (u: TenantUsage) =>
                            u.edition == "pck_per_gigabyte" &&
                            u.value > 0 &&
                            u.usage_name != "storage" &&
                            u.usage_name != "storage_total",
                    ),
                );

                if (currentUser?.licensed) {
                    const inactive = await fetch(
                        `/api/license/count?status=inactive&partnerAcronisId=${currentUser?.partnerAcronisId}`,
                    );
                    const inactiveCount = await inactive.json();
                    setInactiveLicenseCount(inactiveCount.count);

                    const active = await fetch(
                        `/api/license/count?status=active&partnerAcronisId=${currentUser?.partnerAcronisId}`,
                    );
                    const activeCount = await active.json();
                    setActiveLicenseCount(activeCount.count);

                    const completed = await fetch(
                        `/api/license/count?status=completed&partnerAcronisId=${currentUser?.partnerAcronisId}`,
                    );
                    const completedCount = await completed.json();
                    setCompletedLicenseCount(completedCount.count);

                    const expired = await fetch(
                        `/api/license/count?status=expired&partnerAcronisId=${currentUser?.partnerAcronisId}`,
                    );
                    const expiredCount = await expired.json();
                    setExpiredLicenseCount(expiredCount.count);
                }
            },
        },
    );

    useSWR(
        currentUser?.acronisTenantId &&
            `/api/acronis/tenants/${currentUser?.partnerAcronisId}/usages?usage_names=local_storage,storage`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: async (data) => {
                setStoragePerWorkload(
                    data?.items?.find(
                        (u: TenantUsage) =>
                            u.usage_name === "storage" &&
                            u.edition === "pck_per_workload" &&
                            u.infra_id ===
                                "d46a4b2a-2631-4f76-84cd-07ce3aed3dde",
                    ),
                );
                setStoragePerGB(
                    data?.items?.find(
                        (u: TenantUsage) =>
                            u.usage_name === "storage" &&
                            u.edition === "pck_per_gigabyte" &&
                            u.infra_id ===
                                "d46a4b2a-2631-4f76-84cd-07ce3aed3dde",
                    ),
                );
                setLocalStorage(
                    data?.items?.find(
                        (u: TenantUsage) => u.usage_name === "local_storage",
                    ),
                );

                // const workload = data?.items?.find(
                //     (u: TenantUsage) =>
                //         u.usage_name == "storage" &&
                //         u.edition == "pck_per_workload" &&
                //         u.infra_id === "d46a4b2a-2631-4f76-84cd-07ce3aed3dde",
                // );
                const gigabyte = data?.items?.find(
                    (u: TenantUsage) =>
                        u.usage_name == "storage" &&
                        u.edition == "pck_per_gigabyte" &&
                        u.infra_id === "d46a4b2a-2631-4f76-84cd-07ce3aed3dde",
                );
                setSelectedModel(
                    gigabyte?.offering_item?.status ? "perGB" : "perWorkload",
                );

                trigger();
            },
        },
    );

    return (
        <div className="w-full space-y-8 mt-4">
            {/* <h1 className="w-full text-xl text-center font-bold">
                {t("welcomeToPartner")}
            </h1> */}

            <div className="container px-12">
                <Carousel
                    opts={{
                        align: "center",
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
                <div className="flex min-h-24 justify-center items-center">
                    {t("failedToLoad")}
                </div>
            ) : (
                <div className="container m-auto flex flex-col gap-3">
                    {currentUser?.licensed && (
                        <>
                            <h1 className="text-xl font-semibold">
                                {t("licenses")}
                            </h1>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <SmallCard
                                    title={t("passive")}
                                    value={inactiveLicenseCount}
                                    icon={
                                        <LuShield className="size-5 text-muted-foreground" />
                                    }
                                    description={t(
                                        "passiveSmallCardDescription",
                                    )}
                                    onClick={() =>
                                        router.push(
                                            "panel/licenses?tab=passive",
                                        )
                                    }
                                />
                                <SmallCard
                                    title={t("active")}
                                    value={activeLicenseCount}
                                    icon={
                                        <LuShieldCheck className="size-5 text-muted-foreground" />
                                    }
                                    description={t(
                                        "activeSmallCardDescription",
                                    )}
                                    onClick={() =>
                                        router.push("panel/licenses?tab=active")
                                    }
                                />
                                <SmallCard
                                    title={t("completed")}
                                    value={completedLicenseCount}
                                    icon={
                                        <LuShieldAlert className="size-5 text-muted-foreground" />
                                    }
                                    description={t(
                                        "completedSmallCardDescription",
                                    )}
                                    onClick={() =>
                                        router.push(
                                            "panel/licenses?tab=completed",
                                        )
                                    }
                                />
                                <SmallCard
                                    title={t("expired")}
                                    value={expiredLicenseCount}
                                    icon={
                                        <LuShieldOff className="size-5 text-muted-foreground" />
                                    }
                                    description={t(
                                        "expiredSmallCardDescription",
                                    )}
                                    onClick={() =>
                                        router.push(
                                            "panel/licenses?tab=expired",
                                        )
                                    }
                                />
                            </div>

                            <div className="col-span-full text-sm text-muted-foreground">
                                <sup>*</sup>
                                {t("licenseCardWarning")}
                            </div>
                        </>
                    )}

                    <h1 className="text-xl font-semibold">
                        {t("totalUsages")}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <StorageCard
                            title={t("storageCardTitle")}
                            description={t("storageCardDescriptionPW")}
                            model={t("perWorkload")}
                            usage={storagePerWorkload?.value as number}
                            quota={
                                storagePerWorkload?.offering_item?.quota as any
                            }
                        />

                        <div className="flex flex-col gap-3">
                            <UsageCard
                                title="local_storage"
                                description={t("localStorageDescription")}
                                unit="bytes"
                                value={localStorage?.value as number}
                                quota={null as any}
                            />
                            {/* <UsageCard
                                title="local_storage"
                                description={t("localStorageDescription")}
                                unit="bytes"
                                value={100000}
                                quota={null as any}
                            /> */}
                        </div>

                        <StorageCard
                            title={t("storageCardTitle")}
                            description={t("storageCardDescriptionGB")}
                            model={t("perGB")}
                            usage={storagePerGB?.value as number}
                            quota={storagePerGB?.offering_item?.quota as any}
                        />
                    </div>

                    <Tabs
                        value={selectedModel}
                        onValueChange={setSelectedModel}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-24">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-24">
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
