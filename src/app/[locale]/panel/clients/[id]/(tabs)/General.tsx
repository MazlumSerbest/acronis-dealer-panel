import { Card, CardBody } from "@nextui-org/card";

export default function GeneralTab(t: Function, tenant: Tenant) {
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardBody className="flex flex-col divide-y text-zinc-500 text-sm p-0 pb-2">
                    <div className="flex w-full p-4">
                        <h2 className="flex-none font-medium text-lg text-zinc-600">
                            Tenant Information
                        </h2>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium leading-6">{t("id")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {tenant.id}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium leading-6">{t("kind")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {t(tenant.kind)}
                        </dd>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium leading-6">
                            {t("customerType")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {tenant.customer_type}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium leading-6">{t("email")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {tenant.contact.email}
                        </dd>
                    </div>
                    {/* <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium leading-6">
                            {t("currency")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.pricing.currency || "-"}
                        </dd>
                    </div> */}
                </CardBody>
            </Card>
        </div>
    );
}
