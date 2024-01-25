"use client";
import { useTranslations } from "next-intl";
import GeneralTab from "./(tabs)/General";
import LocationsTab from "./(tabs)/Locations";
import { Tabs, Tab } from "@nextui-org/tabs";

export default function SettingsPage() {
    const t = useTranslations("Settings");

    return (
        <div className="flex flex-col w-full items-center mt-4">
            <Tabs
                size="lg"
                color="default"
                key="management"
                aria-label="Management Tabs"
            >
                <Tab key="general" title={t("general")} className="w-full">
                    {GeneralTab()}
                </Tab>
                <Tab key="locations" title={t("locations")} className="w-full">
                    {LocationsTab()}
                </Tab>
            </Tabs>
        </div>
    );
}