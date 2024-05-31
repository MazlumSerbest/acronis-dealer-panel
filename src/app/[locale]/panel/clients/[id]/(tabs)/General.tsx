import { DateTimeFormat } from "@/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
    t: Function;
    tenant: Tenant;
};

export default function GeneralTab(props: Props) {
    const { t, tenant } = props;

    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader className="py-4">
                    <CardTitle>
                        <h2 className="flex-none font-medium text-lg text-zinc-600">
                            Tenant Information
                        </h2>
                    </CardTitle>
                    {/* <CardDescription>Card Description</CardDescription> */}
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col divide-y text-zinc-500 text-sm leading-6 p-2 md:px-5">
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">{t("id")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {tenant?.id || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">{t("kind")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {t(tenant?.kind || "")}
                        </dd>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">{t("customerType")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {tenant?.customer_type || "-"}
                        </dd>
                    </div>
                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">{t("email")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {tenant?.contact?.email || "-"}
                        </dd>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">{t("createdAt")}</dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {DateTimeFormat(tenant?.created_at || "")}
                        </dd>
                    </div>
                    {/* <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 px-4 py-2">
                        <dt className="font-medium">
                            {t("currency")}
                        </dt>
                        <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                            {data.tenantInfo.pricing.currency || "-"}
                        </dd>
                    </div> */}
                </CardContent>
            </Card>
        </div>
    );
}
