"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Chart } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

export interface DataPoint {
  time: string;
  fullDate: string;
  distance: number;
  filledPct: number;
  status: string;
  activity: number;
  event: string | null;
}

// ── Thresholds in filledPct (%) derived from distance thresholds ──────────────
// Using formula: filledPct = ((maxDist - dist) / binDepth) × 100
// Estimated from data: maxDist ≈ 117cm, binDepth ≈ 87cm
// dist >= 80 → EMPTY   → pct ≤ 43%
// dist >= 60 → NORMAL  → pct ≤ 66%
// dist >= 45 → ALMOST FULL → pct ≤ 83%
// dist <  45 → FULL    → pct > 83%
export const THRESHOLD_EMPTY = 43;       // dist = 80
export const THRESHOLD_NORMAL = 66;      // dist = 60
export const THRESHOLD_ALMOST_FULL = 83; // dist = 45

// Detect a sharp fill-level drop (bin emptied) or sudden jump back to 0 after lid open
export function detectEmptyingEvents(data: DataPoint[]): number[] {
  const indices: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    // Lid-open (UNKNOWN) → real value, after a filled period
    const prevFilled = prev.filledPct > 20 && prev.status !== "UNKNOWN";
    const currEmpty =
      curr.status === "EMPTY" || curr.status === "UNKNOWN" || curr.filledPct < 5;
    if (prevFilled && currEmpty) indices.push(i);
  }
  return indices;
}

function buildAnnotations(emptyingIndices: number[]): Record<string, object> {
  const ann: Record<string, object> = {
    dangerZone: {
      type: "box",
      yMin: THRESHOLD_ALMOST_FULL,
      yMax: 100,
      yScaleID: "y",
      backgroundColor: "rgba(239,68,68,0.07)",
      borderWidth: 0,
      label: {
        display: true,
        content: "Danger Zone",
        position: { x: "end", y: "start" },
        color: "rgba(220,38,38,0.6)",
        font: { size: 10 },
        backgroundColor: "transparent",
      },
    },
    lineFull: {
      type: "line",
      yMin: THRESHOLD_ALMOST_FULL,
      yMax: THRESHOLD_ALMOST_FULL,
      yScaleID: "y",
      borderColor: "rgba(239,68,68,0.7)",
      borderWidth: 1.5,
      borderDash: [5, 4],
      label: {
        display: true,
        content: `FULL (${THRESHOLD_ALMOST_FULL}%)`,
        position: "start",
        color: "rgba(239,68,68,0.9)",
        font: { size: 9 },
        backgroundColor: "rgba(255,255,255,0.75)",
        padding: 2,
      },
    },
    lineAlmostFull: {
      type: "line",
      yMin: THRESHOLD_NORMAL,
      yMax: THRESHOLD_NORMAL,
      yScaleID: "y",
      borderColor: "rgba(249,115,22,0.7)",
      borderWidth: 1.5,
      borderDash: [5, 4],
      label: {
        display: true,
        content: `ALMOST FULL (${THRESHOLD_NORMAL}%)`,
        position: "start",
        color: "rgba(249,115,22,0.9)",
        font: { size: 9 },
        backgroundColor: "rgba(255,255,255,0.75)",
        padding: 2,
      },
    },
    lineNormal: {
      type: "line",
      yMin: THRESHOLD_EMPTY,
      yMax: THRESHOLD_EMPTY,
      yScaleID: "y",
      borderColor: "rgba(234,179,8,0.7)",
      borderWidth: 1.5,
      borderDash: [5, 4],
      label: {
        display: true,
        content: `NORMAL (${THRESHOLD_EMPTY}%)`,
        position: "start",
        color: "rgba(202,138,4,0.9)",
        font: { size: 9 },
        backgroundColor: "rgba(255,255,255,0.75)",
        padding: 2,
      },
    },
  };

  emptyingIndices.forEach((idx, i) => {
    ann[`emptying_${i}`] = {
      type: "line",
      xMin: idx,
      xMax: idx,
      xScaleID: "x",
      borderColor: "rgba(99,102,241,0.85)",
      borderWidth: 2,
      label: {
        display: true,
        content: "🗑 Emptied",
        position: "start",
        color: "rgb(99,102,241)",
        font: { size: 10, weight: "bold" },
        backgroundColor: "rgba(255,255,255,0.85)",
        padding: 3,
        yAdjust: -6,
      },
    };
  });

  return ann;
}

interface Props {
  compact?: boolean; // true = smaller ticks, hidden full legend
}

export default function OverflowChartCard({ compact = false }: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/backend/overflow")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error)
    return <p className="text-red-500 text-sm">Failed to load overflow data.</p>;
  if (data.length === 0)
    return <p className="text-gray-400 text-sm animate-pulse">Loading overflow chart…</p>;

  const labels = data.map((d) => d.time);
  const filledPcts = data.map((d) => d.filledPct);
  const activities = data.map((d) => d.activity);
  const emptyingIndices = detectEmptyingEvents(data);

  const chartData = {
    labels,
    datasets: [
      {
        type: "line" as const,
        label: "Fill Level (%)",
        data: filledPcts,
        borderColor: "rgb(99,102,241)",
        backgroundColor: "rgba(99,102,241,0.12)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        yAxisID: "y",
        order: 1,
      },
      {
        type: "bar" as const,
        label: "PIR Activity",
        data: activities,
        backgroundColor: "rgba(234,179,8,0.55)",
        borderColor: "rgba(202,138,4,0.8)",
        borderWidth: 1,
        yAxisID: "y2",
        order: 2,
      },
    ],
  };

  const tickFont = { size: compact ? 9 : 10 };

  const options = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: !compact, position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => {
            const label = ctx.dataset.label ?? "";
            const val = ctx.parsed.y;
            if (label.includes("Fill")) return `Fill: ${val}%`;
            return `Activity: ${val}`;
          },
        },
      },
      annotation: { annotations: buildAnnotations(emptyingIndices) },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: compact ? 8 : 14, font: tickFont, color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      y: {
        min: 0,
        max: 100,
        title: { display: !compact, text: "Fill Level (%)", font: { size: 11 } },
        ticks: { font: tickFont, color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      y2: {
        position: "right" as const,
        min: 0,
        title: { display: !compact, text: "PIR Activity (count)", font: { size: 11 } },
        ticks: { precision: 0, font: tickFont, color: "#6b7280" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div>
      <Chart type="bar" data={chartData} options={options} />

      {/* Emptying events */}
      {emptyingIndices.length > 0 && (
        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded text-sm text-indigo-700">
          🗑{" "}
          <span className="font-semibold">
            {emptyingIndices.length} emptying event
            {emptyingIndices.length > 1 ? "s" : ""} detected
          </span>{" "}
          —{" "}
          {emptyingIndices.map((i, n) => (
            <span key={i} className="font-mono font-medium">
              {n > 0 && ", "}
              {data[i]?.time}
              {data[i - 1] && (
                <span className="text-indigo-400 font-normal">
                  {" "}({data[i - 1].filledPct}% → {data[i].filledPct}%)
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Zone legend */}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
          {[
            { color: "bg-green-400", label: `EMPTY  (< ${THRESHOLD_EMPTY}%)` },
            { color: "bg-yellow-400", label: `NORMAL  (${THRESHOLD_EMPTY}–${THRESHOLD_NORMAL}%)` },
            { color: "bg-orange-400", label: `ALMOST FULL  (${THRESHOLD_NORMAL}–${THRESHOLD_ALMOST_FULL}%)` },
            { color: "bg-red-400", label: `FULL  (> ${THRESHOLD_ALMOST_FULL}%)` },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
