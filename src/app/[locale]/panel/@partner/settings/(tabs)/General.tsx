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

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";

import AcronisWarning from "@/components/AcronisWarning";
import { LuFolderLock, LuCoins, LuTag } from "react-icons/lu";
import useUserStore from "@/store/user";

export default function GeneralTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error, isLoading } = useSWR(
        `/api/acronis/tenants/${currentUser?.acronisTenantId}/info`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (isLoading)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-3">
            <AcronisWarning />

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <LuFolderLock className="size-8 text-green-500/60" />
                    <div>
                        <CardTitle className="font-medium text-xl">
                            {t("security")}
                        </CardTitle>
                        <CardDescription>
                            {t("securitySubtitle")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col divide-y text-sm leading-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("twoFactorAuth")}</dt>
                        <dd className="col-span-1 md:col-span-2">
                            <BoolChip
                                showText
                                value={data.mfa?.mfa_status == "enabled"}
                            />
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("usersCount")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data.mfa?.users_count}
                        </dd>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <LuCoins className="size-8 text-yellow-500/60" />
                    <div>
                        <CardTitle className="font-medium text-xl">
                            {t("pricing")}
                        </CardTitle>
                        <CardDescription>
                            {t("pricingSubtitle")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col divide-y text-sm leading-6">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("mode")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {t(data.pricing?.mode || "")}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("currency")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data.pricing?.currency || "-"}
                        </dd>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <LuTag className="size-8 text-blue-400/90" />
                    <div>
                        <CardTitle className="font-medium text-xl">
                            {t("branding")}
                        </CardTitle>
                        <CardDescription>
                            {t("brandingSubtitle")}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col divide-y text-sm leading-6">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("companyName")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data.branding?.company_name || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("serviceName")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data.branding?.service_name || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("platformTermsUrl")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0 truncate">
                            {data.branding?.platform_terms_url ? (
                                <Link
                                    className="text-sm hover:underline truncate"
                                    target="_blank"
                                    href={data.branding?.platform_terms_url}
                                >
                                    {
                                        data.branding?.platform_terms_url?.split(
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
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data.branding?.terms_url ? (
                                <Link
                                    className="text-sm hover:underline truncate"
                                    target="_blank"
                                    href={data.branding?.terms_url}
                                >
                                    {data.branding?.terms_url?.split("?")[0]}
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full p-2">
                        <dt className="font-medium">{t("privacyPolicyUrl")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data.branding?.privacy_policy_url ? (
                                <Link
                                    className="text-sm hover:underline truncate"
                                    target="_blank"
                                    href={data.branding?.privacy_policy_url}
                                >
                                    {data.branding?.privacy_policy_url}
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
