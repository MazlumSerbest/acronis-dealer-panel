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
import {
    LuBox,
    LuComputer,
    LuDatabase,
    LuDatabaseBackup,
    LuInbox,
    LuMailbox,
    LuMonitor,
    LuServer,
} from "react-icons/lu";

type Props = {
    title: string;
    description?: string;
    unit?: string;
    value: number;
    quota: {
        value: number | null;
    };
    icon?: React.ReactNode;
};

export default function UsageCard({
    title,
    description,
    unit,
    value,
    quota,
    icon,
}: Props) {
    const t = useTranslations("Components.Usage");

    const formattedValue = unit == "bytes" ? formatBytes(value) : value;
    const formattedQuota =
        unit == "bytes" ? formatBytes(quota?.value) : quota?.value;
    const quotaExceeded =
        quota && quota?.value !== null && value > quota?.value;
    const quotaAlmostExceeded =
        quota && quota?.value !== null && value > quota?.value * 0.9;

    return (
        <Card
            className={cn(
                quotaExceeded
                    ? "border-destructive"
                    : quotaAlmostExceeded
                    ? "border-yellow-500"
                    : "",
                "flex flex-col",
            )}
        >
            <CardHeader className="flex flex-row justify-between space-y-0 pb-2 gap-1">
                <CardTitle
                    className={cn(
                        quotaExceeded
                            ? "text-destructive"
                            : quotaAlmostExceeded
                            ? "text-yellow-500"
                            : "",
                        "text-sm font-medium",
                    )}
                >
                    {t(title)}
                </CardTitle>
                <div>
                    {description?.includes("server") ? (
                        <LuServer
                            className={cn(
                                quotaExceeded
                                    ? "text-destructive"
                                    : quotaAlmostExceeded
                                    ? "text-yellow-500"
                                    : "text-muted-foreground",
                                "size-5",
                            )}
                        />
                    ) : description?.includes("workstation") ? (
                        <LuMonitor
                            className={cn(
                                quotaExceeded
                                    ? "text-destructive"
                                    : quotaAlmostExceeded
                                    ? "text-yellow-500"
                                    : "text-muted-foreground",
                                "size-5",
                            )}
                        />
                    ) : description?.includes("vm") ? (
                        <LuBox
                            className={cn(
                                quotaExceeded
                                    ? "text-destructive"
                                    : quotaAlmostExceeded
                                    ? "text-yellow-500"
                                    : "text-muted-foreground",
                                "size-5",
                            )}
                        />
                    ) : description?.includes("mailbox") ? (
                        <LuInbox
                            className={cn(
                                quotaExceeded
                                    ? "text-destructive"
                                    : quotaAlmostExceeded
                                    ? "text-yellow-500"
                                    : "text-muted-foreground",
                                "size-5",
                            )}
                        />
                    ) : (
                        <LuDatabaseBackup
                            className={cn(
                                quotaExceeded
                                    ? "text-destructive"
                                    : quotaAlmostExceeded
                                    ? "text-yellow-500"
                                    : "text-muted-foreground",
                                "size-5",
                            )}
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent className="mt-auto">
                <div
                    className={cn(
                        quotaExceeded
                            ? "text-destructive"
                            : quotaAlmostExceeded
                            ? "text-yellow-500"
                            : "",
                        "text-2xl font-bold",
                    )}
                >
                    {formattedValue}
                    <span className="text-base text-muted-foreground ml-2">
                        {quota && quota?.value !== null
                            ? `/ ${formattedQuota}`
                            : ""}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
