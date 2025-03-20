"use client";
import { useTranslations } from "next-intl";
import ProfileTab from "./(tabs)/Profile";
import ContactsTab from "./(tabs)/Contacts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ManagementPage() {
    const t = useTranslations("Management");

    return (
        <div className="xl:container flex flex-col w-full items-center">
            <Tabs defaultValue="profile" className="flex flex-col w-full">
                <TabsList className="mx-auto md:*:w-[180px] mb-2">
                    <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
                    <TabsTrigger value="contacts">{t("contacts")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                    <ProfileTab />
                </TabsContent>
                <TabsContent value="contacts">
                    <ContactsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
