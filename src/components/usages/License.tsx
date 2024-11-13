import {
    Label,
    Pie,
    PieChart,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

type Props = {
    title?: string;
    description?: string;
    label?: string;
    color?: string;
    total: number;
    value: number;
    onClick?: () => void;
};

export default function LicenseCard({
    title,
    description,
    label,
    color,
    total,
    value,
    onClick,
}: Props) {
    const chartData = [{ type: "active", value, fill: color }];

    const chartConfig = {
        active: {
            label: "Active",
            color: color,
        },
    } satisfies ChartConfig;

    return (
        <Card
            className={cn(
                "z-50 flex flex-col min-w-80",
                onClick && "hover:cursor-pointer",
            )}
            onClick={onClick}
        >
            <CardHeader className="py-4">
                <CardTitle className="">{title}</CardTitle>
                {/* <CardDescription>{description}</CardDescription> */}
            </CardHeader>
            <Separator />
            <CardContent className="pt-3">
                <ChartContainer
                    config={chartConfig}
                    className={cn(
                        "mx-auto aspect-square max-h-[200px]",
                        onClick && "hover:cursor-pointer",
                    )}
                    onClick={onClick}
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={(360 / total) * value}
                        innerRadius={80}
                        outerRadius={140}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                        />
                        <RadialBar dataKey="value" background />
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
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-4xl font-bold"
                                                >
                                                    {value?.toLocaleString() ||
                                                        0}
                                                </tspan>
                                                {label && (
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            24
                                                        }
                                                        className="fill-muted-foreground"
                                                    >
                                                        {label}
                                                    </tspan>
                                                )}
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            {description && (
                <CardFooter className="flex justify-center">
                    <div className="leading-none text-center text-sm text-muted-foreground">
                        {description}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
