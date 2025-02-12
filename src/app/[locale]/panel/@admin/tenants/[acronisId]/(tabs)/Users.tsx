import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Loader from "@/components/loaders/Loader";

import { useTranslations } from "next-intl";
import PartnerTab from "./(userTabs)/Partner";
import AcronisTab from "./(userTabs)/Acronis";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";

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
            defaultValue="active"
            value={status}
            onValueChange={(value) =>
                router.push(`${pathname}?tab=users&status=${value}`)
            }
            className="flex flex-col w-full"
        >
            <TabsList className="max-w-fit">
                <TabsTrigger value="partner">{tu("partner")}</TabsTrigger>
                <TabsTrigger value="acronis">{tu("acronis")}</TabsTrigger>
            </TabsList>
            <TabsContent value="partner">
                <PartnerTab t={t} tenantId={tenant.id || ""} />
            </TabsContent>

            <TabsContent value="acronis">
                <AcronisTab t={t} tenantId={tenant.id || ""} />
            </TabsContent>
        </Tabs>
    );
}
