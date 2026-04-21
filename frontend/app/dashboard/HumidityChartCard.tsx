"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

interface TimelinePoint {
  time: string;
  activity: number;
  humidity: number;
  rain: number;
}

interface ApiResponse {
  correlation: { humidity: string; rain: string };
  timeline: TimelinePoint[];
}

type Mode = "humidity" | "rain";

interface Props {
  compact?: boolean;
}

export default function HumidityChartCard({ compact = false }: Props) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>("humidity");

  useEffect(() => {
    fetch("/api/backend/humidity-bin-usage")
      .then((res) => res.json())
      .then(setApiData)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-red-500 text-sm">Failed to load data.</p>;
  if (!apiData) return <p className="text-gray-400 text-sm animate-pulse">Loading…</p>;

  const { correlation, timeline } = apiData;
  const labels = timeline.map((d) => d.time);
  const activities = timeline.map((d) => d.activity);
  const humidities = timeline.map((d) => d.humidity);
  const rains = timeline.map((d) => d.rain);

  const rHumidity = parseFloat(correlation.humidity);
  const rRain = parseFloat(correlation.rain);

  const weatherDataset =
    mode === "humidity"
      ? {
          type: "line" as const,
          label: "Humidity (%)",
          data: humidities,
          borderColor: "rgb(59,130,246)",
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          yAxisID: "y2",
          order: 1,
        }
      : {
          type: "line" as const,
          label: "Rain (mm)",
          data: rains,
          borderColor: "rgb(99,102,241)",
          fill: false,
          tension: 0.2,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          yAxisID: "y2",
          order: 1,
        };

  const chartData = {
    labels,
    datasets: [
      {
        type: "bar" as const,
        label: "PIR Activity",
        data: activities,
        backgroundColor: "rgba(234,179,8,0.6)",
        borderColor: "rgba(202,138,4,0.8)",
        borderWidth: 1,
        yAxisID: "y",
        order: 2,
      },
      weatherDataset,
    ],
  };

  const tickFont = { size: compact ? 9 : 10 };
  const y2Title = mode === "humidity" ? "Humidity (%)" : "Rain (mm)";

  const options = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: !compact, position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: compact ? 8 : 16, font: tickFont, color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      y: {
        min: 0,
        title: { display: !compact, text: "PIR Activity", font: { size: 11 } },
        ticks: { precision: 0, font: tickFont, color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      y2: {
        position: "right" as const,
        min: 0,
        ...(mode === "humidity" ? { max: 100 } : {}),
        title: { display: !compact, text: y2Title, font: { size: 11 } },
        ticks: { font: tickFont, color: "#6b7280" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  const activeR = mode === "humidity" ? rHumidity : rRain;

  return (
    <div>
      {/* Correlation + toggle row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-3">
          <span className="text-sm text-gray-600">
            Humidity{" "}
            <span className="font-bold text-blue-600">
              r = {rHumidity >= 0 ? "+" : ""}{rHumidity.toFixed(2)}
            </span>
          </span>
          <span className="text-sm text-gray-600">
            Rain{" "}
            <span className="font-bold text-indigo-600">
              r = {rRain >= 0 ? "+" : ""}{rRain.toFixed(2)}
            </span>
          </span>
          {compact && (
            <span className="text-xs text-gray-400 self-center">
              (showing: {mode === "humidity" ? `r = ${activeR.toFixed(2)}` : `r = ${activeR.toFixed(2)}`})
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {(["humidity", "rain"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {m === "humidity" ? "Humidity %" : "Rain mm"}
            </button>
          ))}
        </div>
      </div>

      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
