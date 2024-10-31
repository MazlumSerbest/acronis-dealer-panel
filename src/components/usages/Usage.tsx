import { useTranslations } from "next-intl";
import { formatBytes } from "@/utils/functions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";

type Props = {
    title: string;
    description?: string;
    unit?: string;
    value: number;
    quota: {
        value: number | null;
    };
};

export default function UsageCard({
    title,
    description,
    unit,
    value,
    quota,
}: Props) {
    const t = useTranslations("Components.Usage");

    const formatedValue = unit == "bytes" ? formatBytes(value) : value;
    const formatedQuota =
        unit == "bytes" ? formatBytes(quota?.value) : quota?.value;
    const quotaExceeded = quota?.value && quota?.value && value > quota?.value;
    const quotaAlmostExceeded = quota?.value && value > quota?.value * 0.8;

    return (
        <Card
            className={cn(
                quotaExceeded
                    ? "border-destructive"
                    : quotaAlmostExceeded
                    ? "border-yellow-500"
                    : "",
            )}
        >
            <CardHeader>
                <CardTitle
                    className={cn(
                        quotaExceeded
                            ? "text-destructive"
                            : quotaAlmostExceeded
                            ? "text-yellow-500"
                            : "",
                    )}
                >
                    {t(title)}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <p
                    className={cn(
                        quotaExceeded
                            ? "text-destructive"
                            : quotaAlmostExceeded
                            ? "text-yellow-500"
                            : "",
                        "text-2xl",
                    )}
                >
                    {formatedValue}
                    <span className="text-base text-muted-foreground ml-2">
                        {quota?.value ? `/ ${formatedQuota}` : ""}
                    </span>
                </p>
            </CardContent>
        </Card>
    );
}
