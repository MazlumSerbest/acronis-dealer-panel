import useSWR from "swr";
import { useTranslations } from "next-intl";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUserStore from "@/store/user";
import AcronisWarning from "@/components/AcronisWarning";

export default function ProfileTab() {
    const t = useTranslations("Management");
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

    if (error) return <div>{t("failedToLoad")}</div>;
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
                <CardHeader className="py-4">
                    <CardTitle className="font-medium text-xl">
                        Company Information
                    </CardTitle>
                    {/* <CardDescription>Card Description</CardDescription> */}
                </CardHeader>

                <CardContent className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                    <div>
                        <dt className="font-medium">Legal Company Name</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.name || "-"}
                        </dd>
                    </div>
                    {/* <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-md text-zinc-700 p-4">
                        <dt className="font-medium">Brand Company Name</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            Test
                        </dd>
                    </div> */}
                    <div>
                        <dt className="font-medium">Tax ID</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.title || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">Company Email</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.email || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">Company Phone</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.phone || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">Company Legal Address</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {!data.tenant?.contact?.address1 &&
                            !data.tenant?.contact?.address2
                                ? "-"
                                : (data.tenant?.contact?.address1 || "") +
                                  ", " +
                                  (data.tenant?.contact?.address2 || "")}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">
                            Total Number of Employees
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.organization_size || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-medium">Company Website</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.website || "-"}
                        </dd>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
