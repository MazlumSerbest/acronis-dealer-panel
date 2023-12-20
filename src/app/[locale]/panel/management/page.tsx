"use client";
import { useTranslations } from "next-intl";
import ProfileTab from "./_tabs/Profile";
import ContactsTab from "./_tabs/Contacts";
import UsersTab from "./_tabs/Users";
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
                <Tab key="profile" title={t("profile")} className="w-full">
                    {ProfileTab()}
                </Tab>
                <Tab key="contacts" title={t("contacts")} className="w-full">
                    {ContactsTab()}
                </Tab>
                <Tab key="users" title={t("users")} className="w-full">
                    {UsersTab()}
                </Tab>
            </Tabs>
        </div>
    );
}
