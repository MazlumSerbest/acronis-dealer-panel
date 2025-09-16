import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslations } from "next-intl";
import PartnerTab from "./(userTabs)/Partner";
import AcronisTab from "./(userTabs)/Acronis";
import { cn } from "@/lib/utils";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function UsersTab({ t, tenant }: Props) {
    const tu = useTranslations("Users");
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get("status") || "partner";
    const pathname = usePathname();

    return (
        <Tabs
            value={tenant.kind === "customer" ? "acronis" : status}
            defaultValue={"partner"}
            onValueChange={(value) =>
                router.push(`${pathname}?tab=users&status=${value}`)
            }
            className="flex flex-col w-full"
        >
            <TabsList
                className={cn(
                    "max-w-fit",
                    tenant.kind === "customer" ? "hidden" : "",
                )}
            >
                <TabsTrigger value="partner">{tu("partner")}</TabsTrigger>
                <TabsTrigger value="acronis">{tu("acronis")}</TabsTrigger>
            </TabsList>

            <TabsContent value="partner">
                <PartnerTab t={t} tenant={tenant} />
            </TabsContent>
            <TabsContent value="acronis">
                <AcronisTab t={t} tenant={tenant} />
            </TabsContent>
        </Tabs>
    );
}
