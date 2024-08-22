"use client";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InactiveTab from "./(tabs)/Inactive";
import ActiveTab from "./(tabs)/Active";
import FinishedTab from "./(tabs)/Finished";
import ExpiredTab from "./(tabs)/Expired";

export default function LicensesPage() {
    const tl = useTranslations("Licenses");

    return (
        <Tabs defaultValue="inactive" className="flex flex-col w-full">
            <TabsList className="max-w-fit">
                <TabsTrigger value="inactive">{tl("inactive")}</TabsTrigger>
                <TabsTrigger value="active">{tl("active")}</TabsTrigger>
                <TabsTrigger value="finished">{tl("finished")}</TabsTrigger>
                <TabsTrigger value="expired">{tl("expired")}</TabsTrigger>
            </TabsList>
            <TabsContent value="inactive">
                <InactiveTab />
            </TabsContent>
            <TabsContent value="active">
                <ActiveTab />
            </TabsContent>
            <TabsContent value="finished">
                <FinishedTab />
            </TabsContent>
            <TabsContent value="expired">
                <ExpiredTab />
            </TabsContent>
        </Tabs>
    );
}
