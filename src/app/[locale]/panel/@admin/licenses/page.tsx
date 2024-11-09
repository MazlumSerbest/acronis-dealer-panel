"use client";
import { useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectGroup,
    SelectValue,
    SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslations } from "next-intl";
import UnassignedTab from "./(tabs)/Unassigned";
import AssignedTab from "./(tabs)/Assigned";
import ActiveTab from "./(tabs)/Active";
import CompletedTab from "./(tabs)/Completed";
import ExpiredTab from "./(tabs)/Expired";

export default function LicensesPage() {
    const tl = useTranslations("Licenses");
    const [openTab, setOpenTab] = useState("unassigned");
    const [openAssignedTab, setOpenAssignedTab] = useState("active");

    return (
        <Tabs
            defaultValue="unassigned"
            className="flex flex-col w-full"
            value={openTab}
            onValueChange={(value) => setOpenTab(value)}
        >
            <div className="flex flex-row gap-4">
                <TabsList className="max-w-fit">
                    <TabsTrigger value="unassigned">
                        {tl("unassigned")}
                    </TabsTrigger>
                    <TabsTrigger value="assigned">{tl("assigned")}</TabsTrigger>
                </TabsList>
                {openTab == "assigned" && (
                    <div>
                        <Select
                            defaultValue="active"
                            onValueChange={(value) => {
                                setOpenTab("assigned");
                                setOpenAssignedTab(value);
                            }}
                        >
                            <SelectTrigger className="min-w-52">
                                <SelectValue
                                    className="text-sm"
                                    placeholder={tl("status")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>{tl("status")}</SelectLabel>
                                    <SelectSeparator />
                                </SelectGroup>
                                <SelectItem value="assigned">
                                    {tl("inactive")}
                                </SelectItem>
                                <SelectItem value="active">
                                    {tl("active")}
                                </SelectItem>
                                <SelectItem value="completed">
                                    {tl("completed")}
                                </SelectItem>
                                <SelectItem value="expired">
                                    {tl("expired")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            <TabsContent value="unassigned">
                <UnassignedTab />
            </TabsContent>
            <TabsContent value="assigned" className="mt-0">
                <Tabs value={openAssignedTab}>
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
            </TabsContent>
        </Tabs>
    );
}
