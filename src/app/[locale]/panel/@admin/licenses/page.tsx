"use client";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnassignedTab from "./(tabs)/Unassigned";
import AssignedTab from "./(tabs)/Assigned";
import ActiveTab from "./(tabs)/Active";
import CompletedTab from "./(tabs)/Completed";
import ExpiredTab from "./(tabs)/Expired";

export default function LicensesPage() {
    const tl = useTranslations("Licenses");

    return (
        <Tabs defaultValue="unassigned" className="flex flex-col w-full">
            <TabsList className="max-w-fit">
                <TabsTrigger value="unassigned">{tl("unassigned")}</TabsTrigger>
                <TabsTrigger value="assigned">{tl("assigned")}</TabsTrigger>
                <TabsTrigger value="active">{tl("active")}</TabsTrigger>
                <TabsTrigger value="completed">{tl("completed")}</TabsTrigger>
                <TabsTrigger value="expired">{tl("expired")}</TabsTrigger>
            </TabsList>
            <TabsContent value="unassigned">
                <UnassignedTab />
            </TabsContent>
            <TabsContent value="assigned">
                <AssignedTab />
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
    );
}
