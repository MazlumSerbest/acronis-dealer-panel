"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerTab from "./(tabs)/Partner";
import AcronisTab from "./(tabs)/Acronis";

export default function UsersPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const tab = searchParams.get("tab") || "partner";

    return (
        <Tabs
            defaultValue="partner"
            value={tab}
            onValueChange={(value) => router.push(`${pathname}?tab=${value}`)}
            className="flex flex-col w-full"
        >
            <TabsList className="mx-auto md:*:w-[180px] *:w-full mb-2">
                <TabsTrigger value="partner">{t("partner")}</TabsTrigger>
                <TabsTrigger value="acronis">{t("acronis")}</TabsTrigger>
            </TabsList>

            <TabsContent value="partner">
                <PartnerTab />
            </TabsContent>
            <TabsContent value="acronis">
                <AcronisTab />
            </TabsContent>
        </Tabs>
    );
}
