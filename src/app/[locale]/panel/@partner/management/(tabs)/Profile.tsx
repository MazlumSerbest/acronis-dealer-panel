import useSWR from "swr";
import { useTranslations } from "next-intl";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUserStore from "@/store/user";
import AcronisWarning from "@/components/AcronisWarning";

export default function ProfileTab() {
    const t = useTranslations("General");
    const { user: currentUser } = useUserStore();

    //#region Fetch Data
    const { data, error } = useSWR(
        `/api/acronis/tenants/${currentUser?.acronisTenantId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );
    //#endregion

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <div className="flex flex-col gap-4">
            <AcronisWarning />
            
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="font-medium text-xl">
                        {t("companyInformation")}
                    </CardTitle>
                    {/* <CardDescription>Card Description</CardDescription> */}
                </CardHeader>

                <CardContent className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                    <div>
                        <dt className="font-medium">{t("legalCompanyName")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data?.name || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">{t("taxId")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data?.contact?.title || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">{t("companyEmail")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data?.contact?.email || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">{t("companyPhone")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data?.contact?.phone || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">{t("companyLegalAddress")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {!data?.contact?.address1 &&
                            !data?.contact?.address2
                                ? "-"
                                : (data?.contact?.address1 || "") +
                                  ", " +
                                  (data?.contact?.address2 || "")}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">
                            {t("totalNumberOfEmployees")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data?.contact?.organization_size || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">{t("companyWebsite")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-foreground mt-1 sm:mt-0">
                            {data?.contact?.website || "-"}
                        </dd>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
