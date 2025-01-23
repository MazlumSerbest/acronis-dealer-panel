"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { formatBytes } from "@/utils/functions";
import { chartColors } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
    className?: string;
    title: string;
    description?: string;
    model: string;
    usage: number;
    quota: {
        value: number;
    };
    action?: React.ReactNode;
};

export default function StorageCard({
    className,
    title,
    description,
    model,
    usage,
    quota,
    action,
}: Props) {
    const t = useTranslations("Components.Storage");
    const withoutQuota = !quota || quota?.value === null;
    const available = quota?.value > usage ? quota?.value - usage : 0;
    const total = withoutQuota ? usage : usage + available;
    const chartData = [
        { usage: usage, available: withoutQuota ? null : available },
    ];
    const quotaExceeded =
        quota && quota?.value !== null && usage > quota?.value;

    const chartConfig = {
        usage: {
            label: "Usage",
            color: withoutQuota ? chartColors.blue : chartColors.red,
        },
        available: {
            label: "Available",
            color: chartColors.green,
        },
    } satisfies ChartConfig;

    return (
        <Card
            className={cn(
                "flex flex-col max-h-min",
                quotaExceeded ? "border-destructive" : "",
                className,
            )}
        >
            <CardHeader className="items-center pb-0">
                <CardTitle
                    className={cn(quotaExceeded ? "text-destructive" : "")}
                >
                    {title}
                </CardTitle>
                <CardDescription>{model}</CardDescription>
                {quotaExceeded && (
                    <CardDescription className="leading-none text-destructive font-bold">
                        {t("quotaExceeded")}
                    </CardDescription>
                )}

                {action}
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[250px] -mt-4"
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        innerRadius={80}
                        outerRadius={130}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name, item, index) => (
                                        <>
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                                style={
                                                    {
                                                        "--color-bg": `var(--color-${name})`,
                                                    } as React.CSSProperties
                                                }
                                            />
                                            {chartConfig[
                                                name as keyof typeof chartConfig
                                            ]?.label || name}
                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {
                                                    formatBytes(value).split(
                                                        " ",
                                                    )[0]
                                                }
                                                <span className="font-normal text-muted-foreground">
                                                    {
                                                        formatBytes(
                                                            value,
                                                        ).split(" ")[1]
                                                    }
                                                </span>
                                            </div>
                                        </>
                                    )}
                                />
                            }
                        />
                        <PolarRadiusAxis
                            tick={false}
                            tickLine={false}
                            axisLine={false}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 16}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {quota &&
                                                    quota?.value !== null
                                                        ? formatBytes(usage)
                                                        : formatBytes(
                                                              total,
                                                          ).split(" ")[0]}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 4}
                                                    className="fill-muted-foreground"
                                                >
                                                    {quota &&
                                                    quota?.value !== null
                                                        ? "Quota: " +
                                                          formatBytes(
                                                              quota?.value,
                                                          )
                                                        : formatBytes(
                                                              total,
                                                          ).split(" ")[1]}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="available"
                            fill="var(--color-available)"
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="usage"
                            stackId="a"
                            cornerRadius={5}
                            fill="var(--color-usage)"
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            {description && (
                <CardFooter className="flex flex-col text-xs -mt-24">
                    <div className="leading-none text-muted-foreground ">
                        {description}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
