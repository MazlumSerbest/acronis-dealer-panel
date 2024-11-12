import useSWR from "swr";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Loader from "@/components/loaders/Loader";

import PassiveTab from "./(licenseTabs)/Passive";
import ActiveTab from "./(licenseTabs)/Active";
import CompletedTab from "./(licenseTabs)/Completed";
import ExpiredTab from "./(licenseTabs)/Expired";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function LicensesTab({ t, tenant }: Props) {
    const tl = useTranslations("Licenses");

    const { data, error, isLoading } = useSWR(
        `/api/${tenant.kind}/${tenant.id}`,
    );

    if (error) return <div>{t("failedToLoad")}</div>;
    if (isLoading)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    if (!data) return <div>{t("registrationNotFound")}</div>;
    return (
        <Tabs defaultValue="active" className="flex flex-col w-full">
            <TabsList className="max-w-fit">
                {tenant.kind === "partner" && (
                    <TabsTrigger value="passive">{tl("passive")}</TabsTrigger>
                )}
                <TabsTrigger value="active">{tl("active")}</TabsTrigger>
                <TabsTrigger value="completed">{tl("completed")}</TabsTrigger>
                {tenant.kind === "partner" && (
                    <TabsTrigger value="expired">{tl("expired")}</TabsTrigger>
                )}
            </TabsList>
            {tenant.kind === "partner" && (
                <TabsContent value="passive">
                    <PassiveTab tenant={tenant} />
                </TabsContent>
            )}

            <TabsContent value="active">
                <ActiveTab tenant={tenant} />
            </TabsContent>

            <TabsContent value="completed">
                <CompletedTab tenant={tenant} />
            </TabsContent>

            {tenant.kind === "partner" && (
                <TabsContent value="expired">
                    <ExpiredTab tenant={tenant} />
                </TabsContent>
            )}
        </Tabs>
    );
}
