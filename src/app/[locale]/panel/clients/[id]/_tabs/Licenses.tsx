import { Card, CardBody } from "@nextui-org/card";

export default function LicensesTab(t: Function, tenant: Tenant) {
    return (
        <Card>
            <CardBody className="flex flex-col">
                <h1>Licenses</h1>
            </CardBody>
        </Card>
    );
}
