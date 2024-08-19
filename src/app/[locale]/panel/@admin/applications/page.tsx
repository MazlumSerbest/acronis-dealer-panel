"use client";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WaitingTab from "./(tabs)/Waiting";
import ApprovedTab from "./(tabs)/Approved";
import ResolvedTab from "./(tabs)/Resolved";

export default function ApplicationsPage() {
    const ta = useTranslations("Applications");

    return (
        <Tabs defaultValue="waiting" className="flex flex-col w-full">
            <TabsList className="max-w-fit">
                <TabsTrigger value="waiting">{ta("waiting")}</TabsTrigger>
                <TabsTrigger value="approved">{ta("approved")}</TabsTrigger>
                <TabsTrigger value="resolved">{ta("resolved")}</TabsTrigger>
            </TabsList>
            <TabsContent value="waiting">
                <WaitingTab />
            </TabsContent>
            <TabsContent value="approved">
                <ApprovedTab />
            </TabsContent>
            <TabsContent value="resolved">
                <ResolvedTab />
            </TabsContent>
        </Tabs>
    );
}
