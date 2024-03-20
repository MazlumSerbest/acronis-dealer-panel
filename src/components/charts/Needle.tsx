"use client";
import { PureComponent } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;
const data = [
    { name: "A", value: 60, color: "rgb(59 130 246)" },
    { name: "B", value: 25, color: "rgb(250 204 21)" },
    { name: "C", value: 15, color: "rgb(239 68 68)" },
];
const cx = 100;
const cy = 100;
const iR = 50;
const oR = 100;
const value = 50;

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
        <circle key="circ" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
        <path
            key="path"
            d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
            stroke="#none"
            fill={color}
        />,
    ];
};

export default class Example extends PureComponent {
    render() {
        return (
            <ResponsiveContainer width={300} height="80%">
                <PieChart>
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
                    {needle(value, data, cx, cy, iR, oR, "rgb(161 161 170)")}
                </PieChart>
            </ResponsiveContainer>
        );
    }
}
