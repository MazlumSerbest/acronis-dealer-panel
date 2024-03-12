import useSWR from "swr";
import { useTranslations } from "next-intl";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import useUserStore from "@/store/user";

export default function ProfileTab() {
    const t = useTranslations("Management");
    const { user: currentUser } = useUserStore();

    //#region Fetch Data
    const { data, error } = useSWR(
        `/api/acronis/tenant/${currentUser?.acronisUUID}`,
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    //#endregion
    
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardBody className="flex flex-col divide-y text-zinc-500 text-sm leading-6 p-0 pb-2">
                    <div className="flex w-full p-4">
                        <h2 className="flex-none font-medium text-lg text-zinc-600">
                            Company Information
                        </h2>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">
                            Legal Company Name
                        </dt>
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
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">Tax ID</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.title || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">Company Email</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.email || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">Company Phone</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.phone || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
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
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">
                            Total Number of Employees
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.organization_size || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">Company Website</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant?.contact?.website || "-"}
                        </dd>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
