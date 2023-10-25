"use client"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
);

export function LineChart() {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
    };

    const labels = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const data = {
        labels,
        datasets: [
            {
                fill: "original",
                label: "Error Count",
                data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
        ],
    };

    return <Line options={options} data={data} />;
}
