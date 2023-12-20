import useSWR from "swr";
import { useTranslations } from "next-intl";
import BoolChip from "@/components/BoolChip";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Link } from "@nextui-org/link";
import { BiCheckShield, BiCopyright, BiPurchaseTag } from "react-icons/bi";

export default function GeneralTab() {
    // const t = useTranslations("Settings");
    const t = useTranslations("General");

    const { data, error } = useSWR(
        "/api/acronis/tenant/info/28a5db46-58eb-4a61-b064-122f07ddac6a",
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );

    return (
        <Accordion
            selectionMode="multiple"
            variant="splitted"
            defaultExpandedKeys={["security"]}
            itemClasses={{
                title: "text-zinc-700",
                base: "flex flex-col divide-y p-0",
            }}
        >
            <AccordionItem
                key="security"
                aria-label="Security"
                title={t("security")}
                subtitle={t("securitySubtitle")}
                startContent={
                    <BiCheckShield className="text-4xl text-green-500/60" />
                }
            >
                <div className="flex flex-col divide-y p-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("twoFactorAuth")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2">
                            <BoolChip
                                showText
                                value={
                                    data.tenantInfo.mfa.mfa_status == "enabled"
                                }
                            />
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("usersCount")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.mfa.users_count}
                        </dd>
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem
                key="pricing"
                aria-label="Pricing"
                title={t("pricing")}
                subtitle={t("pricingSubtitle")}
                startContent={
                    <BiPurchaseTag className="text-4xl text-yellow-500/60" />
                }
            >
                <div className="flex flex-col divide-y p-0">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">{t("mode")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {g(data.tenantInfo.pricing.mode)}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("currency")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.pricing.currency || "-"}
                        </dd>
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem
                key="branding"
                aria-label="Branding"
                title={t("branding")}
                subtitle={t("brandingSubtitle")}
                startContent={
                    <BiCopyright className="text-4xl text-blue-400/60" />
                }
            >
                <div className="flex flex-col divide-y p-0">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("companyName")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.branding.company_name || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("serviceName")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.branding.service_name || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("platformTermsUrl")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.branding.platform_terms_url ? (
                                <Link
                                    isExternal
                                    href={
                                        data.tenantInfo.branding
                                            .platform_terms_url
                                    }
                                >
                                    {
                                        data.tenantInfo.branding.platform_terms_url.split(
                                            "?",
                                        )[0]
                                    }
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("termsUrl")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.branding.terms_url ? (
                                <Link
                                    isExternal
                                    href={data.tenantInfo.branding.terms_url}
                                >
                                    {
                                        data.tenantInfo.branding.terms_url.split(
                                            "?",
                                        )[0]
                                    }
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 w-full text-base text-zinc-500 p-2">
                        <dt className="font-medium leading-6">
                            {t("privacyPolicyUrl")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.branding.privacy_policy_url ? (
                                <Link
                                    isExternal
                                    href={
                                        data.tenantInfo.branding
                                            .privacy_policy_url
                                    }
                                >
                                    {
                                        data.tenantInfo.branding
                                            .privacy_policy_url
                                    }
                                </Link>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                </div>
            </AccordionItem>
        </Accordion>
    );
}
