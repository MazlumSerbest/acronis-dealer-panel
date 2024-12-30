"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PassiveTab from "./(tabs)/Passive";
import ActiveTab from "./(tabs)/Active";
import CompletedTab from "./(tabs)/Completed";
import ExpiredTab from "./(tabs)/Expired";

export default function LicensesPage() {
    const t = useTranslations("General");
    const tl = useTranslations("Licenses");
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "active";
    const pathname = usePathname();

    return (
        <>
            <div className="col-span-full text-sm text-muted-foreground">
                <sup>*</sup>
                {t("licenseCardWarning")}
            </div>

            <Tabs
                defaultValue="active"
                value={tab}
                onValueChange={(value) =>
                    router.push(`${pathname}?tab=${value}`)
                }
                className="flex flex-col w-full"
            >
                <TabsList className="max-w-fit">
                    <TabsTrigger value="passive">{tl("passive")}</TabsTrigger>
                    <TabsTrigger value="active">{tl("active")}</TabsTrigger>
                    <TabsTrigger value="completed">
                        {tl("completed")}
                    </TabsTrigger>
                    <TabsTrigger value="expired">{tl("expired")}</TabsTrigger>
                </TabsList>
                <TabsContent value="passive">
                    <PassiveTab />
                </TabsContent>
                <TabsContent value="active">
                    <ActiveTab />
                </TabsContent>
                <TabsContent value="completed">
                    <CompletedTab />
                </TabsContent>
                <TabsContent value="expired">
                    <ExpiredTab />
                </TabsContent>
            </Tabs>
        </>
    );
}
