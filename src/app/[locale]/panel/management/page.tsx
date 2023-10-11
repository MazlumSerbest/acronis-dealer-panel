"use client";
import { useTranslations } from "next-intl";
import ProfileTab from "./tabs/Profile";
import UsersTab from "./tabs/Users";
import { Tabs, Tab } from "@nextui-org/tabs";

export default function ManagementPage() {
    const t = useTranslations("Management");

    return (
        <div className="flex flex-col w-full items-center mt-4">
            <Tabs
                size="lg"
                color="default"
                key="management"
                aria-label="Management Tabs"
            >
                <Tab key="general" title={t("profile")}>
                    {ProfileTab()}
                </Tab>
                <Tab key="users" title={t("users")} className="w-full">
                    {UsersTab()}
                </Tab>
            </Tabs>
        </div>
    );
}
