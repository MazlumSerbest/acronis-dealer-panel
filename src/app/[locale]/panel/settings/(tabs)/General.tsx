import useSWR from "swr";
import { useTranslations } from "next-intl";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Link } from "@nextui-org/link";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import BoolChip from "@/components/BoolChip";

import { BiCheckShield, BiCopyright, BiPurchaseTag } from "react-icons/bi";
import useUserStore from "@/store/user";
import { Separator } from "@/components/ui/separator";

export default function GeneralTab() {
    const ts = useTranslations("Settings");
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    const { data, error } = useSWR(
        `/api/acronis/tenant/info/${currentUser?.acronisUUID}`,
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
                    <CardHeader className="flex flex-row items-center gap-2 p-4">
                        <BiCheckShield className="size-8 text-green-500/60" />
                        <div>
                            <CardTitle className="font-medium text-lg text-zinc-600">
                                {ts("security")}
                            </CardTitle>
                            <CardDescription>
                                {ts("securitySubtitle")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-col divide-y text-zinc-500 text-sm leading-6 py-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">
                                {t("twoFactorAuth")}
                            </dt>
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
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">{t("usersCount")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.mfa?.users_count}
                            </dd>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center gap-2 p-4">
                        <BiPurchaseTag className="size-8 text-yellow-500/60" />
                        <div>
                            <CardTitle className="font-medium text-lg text-zinc-600">
                                {ts("pricing")}
                            </CardTitle>
                            <CardDescription>
                                {ts("pricingSubtitle")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-col divide-y text-zinc-500 text-sm leading-6 py-2">
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">{t("mode")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {t(data.tenantInfo?.pricing.mode || "")}
                            </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">{t("currency")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.pricing?.currency || "-"}
                            </dd>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center gap-2 p-4">
                        <BiCopyright className="size-8 text-blue-400/60" />
                        <div>
                            <CardTitle className="font-medium text-lg text-zinc-600">
                                {ts("branding")}
                            </CardTitle>
                            <CardDescription>
                                {ts("brandingSubtitle")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-col divide-y text-zinc-500 text-sm leading-6 py-2">
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">{t("companyName")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.branding?.company_name || "-"}
                            </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">{t("serviceName")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.branding?.service_name || "-"}
                            </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">
                                {t("platformTermsUrl")}
                            </dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.branding
                                    ?.platform_terms_url ? (
                                    <Link
                                        isExternal
                                        className="text-sm"
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
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">{t("termsUrl")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.branding?.terms_url ? (
                                    <Link
                                        isExternal
                                        className="text-sm"
                                        href={
                                            data.tenantInfo?.branding?.terms_url
                                        }
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
                        <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-zinc-500 p-2">
                            <dt className="font-medium">
                                {t("privacyPolicyUrl")}
                            </dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.tenantInfo?.branding
                                    ?.privacy_policy_url ? (
                                    <Link
                                        isExternal
                                        className="text-sm"
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
