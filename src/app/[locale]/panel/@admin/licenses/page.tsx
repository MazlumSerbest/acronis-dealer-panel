"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
import { Label } from "@/components/ui/label";

export default function LicensesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "unassigned";
    const status = searchParams.get("status") || "active";
    const pathname = usePathname();

    const tl = useTranslations("Licenses");

    return (
        <Tabs
            defaultValue="unassigned"
            value={tab}
            className="flex flex-col w-full"
            onValueChange={(value) =>
                router.push(`/panel/licenses?tab=${value}`)
            }
        >
            <div className="flex flex-row gap-4">
                <TabsList className="max-w-fit">
                    <TabsTrigger value="unassigned">
                        {tl("unassigned")}
                    </TabsTrigger>
                    <TabsTrigger value="assigned">{tl("assigned")}</TabsTrigger>
                </TabsList>

                {tab === "assigned" && (
                    <div className="flex flex-row items-center gap-2">
                        <Label className="text-sm font-semibold">{tl("status") + ":"}</Label>

                        <Select
                            value={status}
                            onValueChange={(value) =>
                                router.push(
                                    `${pathname}?tab=assigned&status=${value}`,
                                )
                            }
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
                <Tabs defaultValue="active" value={status}>
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
