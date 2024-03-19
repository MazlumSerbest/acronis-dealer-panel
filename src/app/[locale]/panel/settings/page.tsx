"use client";
import { useTranslations } from "next-intl";
import GeneralTab from "./(tabs)/General";
import LocationsTab from "./(tabs)/Locations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
    const t = useTranslations("Settings");

    return (
        <div className="flex w-full mt-4">
            <Tabs defaultValue="general" className="flex flex-col w-full">
                <TabsList className="mx-auto *:w-[200px] mb-2">
                    <TabsTrigger value="general">
                        <h5 className="">{t("general")}</h5>
                    </TabsTrigger>
                    <TabsTrigger value="locations">
                        {t("locations")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="general">{GeneralTab()}</TabsContent>
                <TabsContent value="locations">{LocationsTab()}</TabsContent>
            </Tabs>
        </div>
    );
}
