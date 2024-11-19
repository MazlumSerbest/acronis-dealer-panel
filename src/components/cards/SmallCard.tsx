import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type Props = {
    title: string;
    icon: React.ReactNode;
    value: string | number;
    description?: string;
};

export default function SmallCard({ title, icon, value, description }: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
