"use client";
import { PureComponent } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Props = {
    iR?: number;
    oR?: number;
    value: number;
    total: number;
};

export default function NeedleChart(props: Props) {
    const { iR = 50, oR = 100, value, total } = props;
    const maxValue = value < total ? value : total;
    const RADIAN = Math.PI / 180;
    const cx = 100;
    const cy = 100;
    const data = [
        { name: "A", value: total * 0.6, color: "rgba(59, 130, 246, 0.8)" },
        { name: "B", value: total * 0.25, color: "rgba(250, 204, 21, 0.8)" },
        { name: "C", value: total * 0.15, color: "rgba(239, 68, 68, 0.8)" },
    ];

    const needle = (
        value: number,
        data: any[],
        cx: number,
        cy: number,
        iR: number,
        oR: number,
        color: string,
    ) => {
        let total = 0;
        data.forEach((v) => {
            total += v.value;
        });
        const ang = 180.0 * (1 - value / total);
        const length = (iR + 2 * oR) / 3;
        const sin = Math.sin(-RADIAN * ang);
        const cos = Math.cos(-RADIAN * ang);
        const r = 5;
        const x0 = cx + 5;
        const y0 = cy + 5;
        const xba = x0 + r * sin;
        const yba = y0 - r * cos;
        const xbb = x0 - r * sin;
        const ybb = y0 + r * cos;
        const xp = x0 + length * cos;
        const yp = y0 + length * sin;

        return [
            <circle
                key="circ"
                cx={x0}
                cy={y0}
                r={r}
                fill={color}
                stroke="none"
            />,
            <path
                key="path"
                d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
                stroke="#none"
                fill={color}
            />,
        ];
    };

    return (
        <ResponsiveContainer
            aspect={2}
            width={250}
            className="flex place-items-center"
        >
            <PieChart margin={{ right: 0, left: 25 }}>
                <Pie
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    data={data}
                    cx={cx}
                    cy={cy}
                    innerRadius={iR}
                    outerRadius={oR}
                    fill="#8884d8"
                    stroke="none"
                    className="outline-none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                {needle(maxValue, data, cx, cy, iR, oR, "rgb(82 82 91)")}
            </PieChart>
        </ResponsiveContainer>
    );
}
