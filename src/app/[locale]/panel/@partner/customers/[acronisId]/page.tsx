"use client";
import useSWR from "swr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import Loader from "@/components/loaders/Loader";
import CustomersTab from "./(tabs)/Customers";
import GeneralTab from "./(tabs)/General";
import LicensesTab from "./(tabs)/Licenses";
import UsersTab from "./(tabs)/Users";
import useUserStore from "@/store/user";

export default function CustomerDetail({
    params,
}: {
    params: { acronisId: string };
}) {
    const t = useTranslations("General");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { user: currentUser } = useUserStore();
    const tab = searchParams.get("tab") || "general";

    const { data, error, isLoading } = useSWR(
        `/api/acronis/tenants/${params.acronisId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (isLoading)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <div className="flex flex-col gap-2">
            <div className="container relative flex w-full items-center gap-2">
                <h1 className="flex-1 font-semibold text-2xl text-blue-400 text-center mt-4 md:mt-2 truncate">
                    {data?.name || ""}
                </h1>
                <div className="hidden sm:flex sm:absolute right-0 gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <LuChevronLeft className="size-6 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            router.forward();
                        }}
                    >
                        <LuChevronRight className="size-6 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <div className="w-full">
                <Tabs
                    defaultValue="general"
                    value={tab}
                    onValueChange={(value) =>
                        router.push(`${pathname}?tab=${value}`)
                    }
                    className="flex flex-col w-full"
                >
                    {data?.kind === "customer" && !currentUser?.licensed ? (
                        <></>
                    ) : (
                        <TabsList className="mx-auto md:*:w-[180px] *:w-full mb-2">
                            <TabsTrigger value="general">
                                {t("general")}
                            </TabsTrigger>
                            {data?.kind === "partner" && (
                                <TabsTrigger value="customers">
                                    {t("customers")}
                                </TabsTrigger>
                            )}
                            {currentUser?.licensed && (
                                <TabsTrigger value="licenses">
                                    {t("licenses")}
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="users">
                                {data?.kind === "partner"
                                    ? t("users")
                                    : t("acronisUsers")}
                            </TabsTrigger>
                        </TabsList>
                    )}

                    <TabsContent value="general">
                        <GeneralTab t={t} tenant={data} />
                    </TabsContent>
                    {data?.kind === "partner" && (
                        <TabsContent value="customers">
                            <CustomersTab t={t} tenant={data} />
                        </TabsContent>
                    )}
                    {currentUser?.licensed && (
                        <TabsContent value="licenses">
                            <LicensesTab t={t} tenant={data} />
                        </TabsContent>
                    )}
                    <TabsContent value="users">
                        <UsersTab t={t} tenant={data} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
