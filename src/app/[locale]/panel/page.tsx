import { Card, CardContent } from "@/components/ui/card";
import { BiDesktop, BiShield, BiData } from "react-icons/bi";
import PanelCard from "@/components/PanelCard";
import { LineChart } from "@/components/charts/LineChart";

export default function PanelPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4 md:mt-0">
            <PanelCard
                header="Total Machines"
                content={
                    <h1 className="font-bold text-7xl text-zinc-500">20</h1>
                }
                icon={
                    <BiDesktop className="text-5xl md:text-6xl text-blue-400/50" />
                }
            />
            <PanelCard
                header="Total License"
                content={
                    <h1 className="font-bold text-7xl text-zinc-500">150</h1>
                }
                icon={
                    <BiShield className="text-5xl md:text-6xl text-blue-400/50" />
                }
            />
            <PanelCard
                header="Total Location"
                content={
                    <h1 className="font-bold text-7xl text-zinc-500">58</h1>
                }
                icon={
                    <BiData className="text-5xl md:text-6xl text-blue-400/50" />
                }
            />
            {/* <PanelCard
                header="Total Usage"
                content={
                    <CircularProgress
                        value={120}
                        maxValue={500}
                        showValueLabel={true}
                        size="lg"
                        formatOptions={{
                            style: "unit",
                            unit: "gigabyte",
                        }}
                        classNames={{
                            svg: "w-32 h-32 drop-shadow-md",
                            indicator: "text-green-400",
                            value: "text-2xl font-semibold text-green-400",
                        }}
                    />
                }
            /> */}
            <Card className="col-span-1 md:col-span-2 border-b-4 border-zinc-300">
                <CardContent className="flex flex-col gap-2 pt-6">
                    {/* <Progress
                        label="Total"
                        showValueLabel={true}
                        value={90}
                        classNames={{
                            label: "text-zinc-500 font-semibold",
                            indicator: "bg-blue-400",
                            value: "text-zinc-500",
                        }}
                    />
                    <Progress
                        label="Expired Licenses"
                        showValueLabel={true}
                        value={500}
                        maxValue={5000}
                        formatOptions={{
                            style: "decimal",
                        }}
                        classNames={{
                            label: "text-zinc-500 font-semibold",
                            indicator: "bg-red-400",
                            value: "text-zinc-500",
                        }}
                    /> */}
                </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2 row-span-2 border-b-4 border-zinc-300">
                <CardContent className="flex flex-col p-6 pt-4 items-center gap-2">
                    <h6 className="text-sm uppercase font-bold text-blue-400">
                        Daily Error Count
                    </h6>
                    <LineChart />
                </CardContent>
            </Card>
            {/* <PanelCard
                header="Total Usage"
                content={
                    <CircularProgress
                        value={120}
                        maxValue={500}
                        showValueLabel={true}
                        size="lg"
                        formatOptions={{
                            style: "unit",
                            unit: "gigabyte",
                        }}
                        classNames={{
                            svg: "w-32 h-32 drop-shadow-md",
                            indicator: "text-green-400",
                            value: "text-2xl font-semibold text-green-400",
                        }}
                    />
                }
            /> */}
        </div>
    );
}
