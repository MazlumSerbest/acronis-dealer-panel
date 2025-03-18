"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PotentialTab from "./(tabs)/Potential";
import ContactedTab from "./(tabs)/Contacted";
import WonTab from "./(tabs)/Won";
import LostTab from "./(tabs)/Lost";

export default function PotentialPartnersPage() {
    const t = useTranslations("General");
    const tp = useTranslations("General.Pages");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const tab = searchParams.get("tab") || "potential";

    return (
        <Tabs
            defaultValue="general"
            value={tab}
            onValueChange={(value) => router.push(`${pathname}?tab=${value}`)}
            className="flex flex-col w-full"
        >
            <TabsList className="mx-auto  md:*:w-[200px] *:w-full mb-2">
                <TabsTrigger value="potential">{t("potential")}</TabsTrigger>
                <TabsTrigger value="contacted">{t("contacted")}</TabsTrigger>
                <TabsTrigger value="won">{t("won")}</TabsTrigger>
                <TabsTrigger value="lost">{t("lost")}</TabsTrigger>
            </TabsList>

            <TabsContent value="potential">
                <PotentialTab />
            </TabsContent>
            <TabsContent value="contacted">
                <ContactedTab />
            </TabsContent>
            <TabsContent value="won">
                <WonTab />
            </TabsContent>
            <TabsContent value="lost">
                <LostTab />
            </TabsContent>
        </Tabs>
    );
}
