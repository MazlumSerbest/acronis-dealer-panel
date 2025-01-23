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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import StorageCard from "@/components/cards/Storage";
import UsageCard from "@/components/cards/Usage";
import SmallCard from "@/components/cards/SmallCard";

import useUserStore from "@/store/user";
import {
    LuShield,
    LuShieldCheck,
    LuShieldQuestion,
    LuSigma,
} from "react-icons/lu";
import { cn } from "@/lib/utils";
import Editor from "@/components/editor/editor";

export default function PanelPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { user: currentUser } = useUserStore();

    const [openNews, setOpenNews] = useState<boolean>(false);
    const [currentNews, setCurrentNews] = useState<any>();

    const [usagesPerWorkload, setUsagesPerWorkload] = useState<TenantUsage[]>();
    const [storagePerWorkload, setStoragePerWorkload] = useState<TenantUsage>();
    const [usagesPerGB, setUsagesPerGB] = useState<TenantUsage[]>();
    const [storagePerGB, setStoragePerGB] = useState<TenantUsage>();
    const [localStorage, setLocalStorage] = useState<TenantUsage>();

    const [selectedModel, setSelectedModel] = useState<string>("perWorkload");

    const [totalLicenseCount, setTotalLicenseCount] = useState<number>(0);
    const [unassignedLicenseCount, setUnassignedLicenseCount] =
        useState<number>(0);
    const [assignedLicenseCount, setAssignedLicenseCount] = useState<number>(0);
    const [activeLicenseCount, setActiveLicenseCount] = useState<number>(0);

    //#region Usage Data
    const { error: errorUsages, trigger: triggerUsages } = useSWRMutation(
        `/api/acronis/tenants/${currentUser?.acronisTenantId}/usages`,
        async (url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch usages");
            return response.json();
        },
        {
            onSuccess: async (data) => {
                setUsagesPerWorkload(
                    data?.items?.filter(
                        (u: TenantUsage) =>
                            u.edition == "pck_per_workload" &&
                            u.value > 0 &&
                            u.usage_name != "storage" &&
                            u.usage_name != "storage_total",
                    ),
                );
                setUsagesPerGB(
                    data?.items?.filter(
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
    //#endregion

    //#region News Data
    const {
        data: news,
        error: errorNews,
        trigger: triggerNews,
    } = useSWRMutation(`/api/news?status=active,draft`, async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch usages");
        return response.json();
    });
    //#endregion

    //#region Storage Data
    useSWR(
        currentUser?.acronisTenantId &&
            `/api/acronis/tenants/${currentUser?.acronisTenantId}/usages?usage_names=local_storage,storage`,
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

                triggerNews();
                triggerUsages();
            },
        },
    );
    //#endregion

    return (
        <>
            <div className="w-full space-y-8 mt-4">
                {/* <h1 className="w-full text-xl text-center font-bold">
                {t("welcomeToAdmin")}
            </h1> */}

                <div className="container px-12">
                    {errorNews ? (
                        <></>
                    ) : (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 5000,
                                }),
                            ]}
                        >
                            <CarouselContent>
                                {!news ? (
                                    <>
                                        <CarouselItem
                                            key={1}
                                            className="flex items-center min-h-[200px] md:basis-1/2"
                                        >
                                            <AspectRatio ratio={16 / 9}>
                                                <div className="rounded-xl object-cover animate-pulse bg-slate-200 w-full h-full"></div>
                                            </AspectRatio>
                                        </CarouselItem>
                                        <CarouselItem
                                            key={2}
                                            className="flex items-center min-h-[200px] md:basis-1/2"
                                        >
                                            <AspectRatio ratio={16 / 9}>
                                                <div className="rounded-xl object-cover animate-pulse bg-slate-200 w-full h-full"></div>
                                            </AspectRatio>
                                        </CarouselItem>
                                    </>
                                ) : (
                                    news?.map((item: any) => (
                                        <CarouselItem
                                            key={item.id}
                                            className={cn(
                                                "flex items-center min-h-[200px] md:basis-1/2",
                                                item.content
                                                    ? "cursor-pointer"
                                                    : "",
                                            )}
                                            onClick={() => {
                                                if (!item.content) return;
                                                setCurrentNews(item);
                                                setOpenNews(true);
                                            }}
                                        >
                                            <AspectRatio
                                                ratio={16 / 9}
                                                className="relative"
                                            >
                                                {item.status === "draft" ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="absolute top-2 right-2 z-50"
                                                    >
                                                        {t("draft")}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="absolute top-2 right-2 z-50 bg-green-600 hover:bg-green-600/90">
                                                        {t("active")}
                                                    </Badge>
                                                )}
                                                <Image
                                                    src={item.image}
                                                    className="rounded-xl object-cover"
                                                    fill
                                                    alt={item.title}
                                                />
                                            </AspectRatio>
                                        </CarouselItem>
                                    ))
                                )}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    )}
                </div>

                {errorUsages ? (
                    <div className="flex min-h-24 justify-center items-center">
                        {t("failedToLoad")}
                    </div>
                ) : (
                    <div className="container m-auto flex flex-col gap-3">
                        <h1 className="text-xl font-semibold">
                            {t("licenses")}
                        </h1>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                                description={t(
                                    "unassignedSmallCardDescription",
                                )}
                                onClick={() => router.push("panel/licenses")}
                            />
                            <SmallCard
                                title={t("assigned")}
                                value={assignedLicenseCount}
                                icon={
                                    <LuShield className="size-5 text-muted-foreground" />
                                }
                                description={t("assignedSmallCardDescription")}
                                onClick={() =>
                                    router.push(
                                        "panel/licenses?tab=assigned&status=assigned",
                                    )
                                }
                            />
                            <SmallCard
                                title={t("active")}
                                value={activeLicenseCount}
                                icon={
                                    <LuShieldCheck className="size-5 text-muted-foreground" />
                                }
                                description={t("activeSmallCardDescription")}
                                onClick={() =>
                                    router.push(
                                        "panel/licenses?tab=assigned&status=active",
                                    )
                                }
                            />
                        </div>

                        <h1 className="text-xl font-semibold mt-4">
                            {t("totalUsages")}
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            <StorageCard
                                title={t("storageCardTitle")}
                                description={t("storageCardDescriptionPW")}
                                model={t("perWorkload")}
                                usage={storagePerWorkload?.value as number}
                                quota={
                                    storagePerWorkload?.offering_item
                                        ?.quota as any
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
                            </div>

                            <StorageCard
                                title={t("storageCardTitle")}
                                description={t("storageCardDescriptionGB")}
                                model={t("perGB")}
                                usage={storagePerGB?.value as number}
                                quota={
                                    storagePerGB?.offering_item?.quota as any
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-24">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-24">
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
                    </div>
                )}
            </div>

            <Dialog open={openNews} onOpenChange={setOpenNews}>
                <DialogContent className="flex flex-col md:w-8/12 lg:w-6/12 max-w-none max-h-screen overflow-auto [&>button]:hidden">
                    <DialogHeader>
                        <AspectRatio ratio={16 / 9}>
                            <Image
                                src={currentNews?.image}
                                alt={currentNews?.title}
                                fill
                                className="rounded-xl object-cover"
                            />
                        </AspectRatio>
                    </DialogHeader>

                    <h1 className="text-2xl font-bold mt-4 text-center text-blue-400">
                        {currentNews?.title}
                    </h1>

                    <div className="min-w-full">
                        <Editor
                            editable={false}
                            initialContent={JSON.parse(currentNews?.content || "[]")}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => setOpenNews(false)}
                            className="bg-blue-400 hover:bg-blue-400/90"
                        >
                            {t("close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
