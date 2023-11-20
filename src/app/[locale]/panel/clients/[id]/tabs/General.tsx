import { Card, CardBody } from "@nextui-org/card";

export default function GeneralTab(t: Function, tenant: Tenant) {
    return (
        <Card>
            <CardBody className="flex flex-col">
                <h1>Tenant Info</h1>
                <h1>{tenant.id}</h1>
                <h1>{tenant.kind}</h1>
            </CardBody>
        </Card>
    );
}
