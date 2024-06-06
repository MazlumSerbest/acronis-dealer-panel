import useSWR from "swr";
import { useTranslations } from "next-intl";
import Link from "next/link";

import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";

import { LuFolderLock, LuCoins, LuTag } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function GeneralTab() {
    const ts = useTranslations("Settings");
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error } = useSWR(
        `/api/acronis/tenant/info/${currentUser?.acronisTenantUUID}`,
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <LuFolderLock className="size-8 text-green-500/60" />
                    <div>
                        <CardTitle className="font-medium text-xl">
                            {ts("security")}
                        </CardTitle>
                        <CardDescription>
                            {ts("securitySubtitle")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col divide-y text-sm leading-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("twoFactorAuth")}</dt>
                        <dd className="col-span-1 md:col-span-2">
                            <BoolChip
                                showText
                                value={
                                    data.tenantInfo?.mfa?.mfa_status ==
                                    "enabled"
                                }
                            />
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("usersCount")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo?.mfa?.users_count}
                        </dd>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <LuCoins className="size-8 text-yellow-500/60" />
                    <div>
                        <CardTitle className="font-medium text-xl">
                            {ts("pricing")}
                        </CardTitle>
                        <CardDescription>
                            {ts("pricingSubtitle")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col divide-y text-sm leading-6">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("mode")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {t(data.tenantInfo?.pricing.mode || "")}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("currency")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo?.pricing?.currency || "-"}
                        </dd>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <LuTag className="size-8 text-blue-400/60" />
                    <div>
                        <CardTitle className="font-medium text-xl">
                            {ts("branding")}
                        </CardTitle>
                        <CardDescription>
                            {ts("brandingSubtitle")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col divide-y text-sm leading-6">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("companyName")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo?.branding?.company_name || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("serviceName")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo?.branding?.service_name || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("platformTermsUrl")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0 truncate">
                            {data.tenantInfo?.branding?.platform_terms_url ? (
                                <Link
                                    className="text-sm hover:underline truncate"
                                    target="_blank"
                                    href={
                                        data.tenantInfo?.branding
                                            ?.platform_terms_url
                                    }
                                >
                                    {
                                        data.tenantInfo?.branding?.platform_terms_url?.split(
                                            "?",
                                        )[0]
                                    }
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("termsUrl")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo?.branding?.terms_url ? (
                                <Link
                                    className="text-sm hover:underline truncate"
                                    target="_blank"
                                    href={data.tenantInfo?.branding?.terms_url}
                                >
                                    {
                                        data.tenantInfo?.branding?.terms_url?.split(
                                            "?",
                                        )[0]
                                    }
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("privacyPolicyUrl")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo?.branding?.privacy_policy_url ? (
                                <Link
                                    className="text-sm hover:underline truncate"
                                    target="_blank"
                                    href={
                                        data.tenantInfo?.branding
                                            ?.privacy_policy_url
                                    }
                                >
                                    {
                                        data.tenantInfo?.branding
                                            ?.privacy_policy_url
                                    }
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
