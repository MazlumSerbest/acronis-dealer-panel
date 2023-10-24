import useSWR from "swr";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { useTranslations } from "next-intl";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { BiEdit } from "react-icons/bi";

export default function ProfileTab() {
    const t = useTranslations("Management");

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(
        "/api/acronis/tenant/28a5db46-58eb-4a61-b064-122f07ddac6a",
        fetcher,
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );

    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardBody className="flex flex-col divide-y p-0">
                    <div className="flex w-full p-4">
                        <h2 className="flex-none font-medium text-xl text-zinc-700">
                            Company Information
                        </h2>
                        <div className="flex-1 flex place-content-end items-center">
                            <BiEdit
                                className="right-1 text-2xl text-blue-400 cursor-pointer"
                                onClick={() => {}}
                            />
                        </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium leading-6">
                            Legal Company Name
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant.name || "-"}
                        </dd>
                    </div>
                    {/* <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-md text-zinc-700 p-4">
                        <dt className="font-medium">Brand Company Name</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            Test
                        </dd>
                    </div> */}
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium">Tax ID</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant.contact.title || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium">Company Email</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant.contact.email || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium">Company Phone</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant.contact.phone || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium">Company Legal Address</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {!data.tenant.contact.address1 &&
                            !data.tenant.contact.address2
                                ? "-"
                                : (data.tenant.contact.address1 || "") +
                                  ", " +
                                  (data.tenant.contact.address2 || "")}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium">
                            Total Number of Employees
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant.contact.organization_size || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 text-base text-zinc-700 p-4">
                        <dt className="font-medium">Company Website</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenant.contact.website || "-"}
                        </dd>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
