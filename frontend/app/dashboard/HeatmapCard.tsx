"use client";

import { useEffect, useState } from "react";

type CellData = { count: number; isRainy?: boolean; rain?: number };
type HeatmapData = Record<string, Record<string, CellData>>;

interface HeatmapResponse {
  labels: string[];
  data: HeatmapData;
}

function formatDayLabel(raw: string): string {
  const d = new Date(raw);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getCellStyle(count: number, max: number): React.CSSProperties {
  if (count === 0 || max === 0) return { backgroundColor: "rgb(243,244,246)" };
  const t = count / max;
  // White → indigo-600
  const r = Math.round(255 - t * (255 - 79));
  const g = Math.round(255 - t * (255 - 70));
  const b = Math.round(255 - t * (255 - 229));
  return { backgroundColor: `rgb(${r},${g},${b})` };
}

export default function HeatmapCard() {
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/backend/activity_frequency")
      .then((res) => res.json())
      .then(setHeatmap)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-red-500 text-sm">Failed to load heatmap.</p>;
  if (!heatmap) return <p className="text-gray-400 text-sm animate-pulse">Loading heatmap…</p>;

  const days = Object.keys(heatmap.data["0"] ?? {});
  const allCounts = Object.values(heatmap.data).flatMap((row) =>
    Object.values(row).map((cell) => cell.count)
  );
  const max = Math.max(...allCounts, 1);

  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-6 overflow-x-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Activity Heatmap (PIR)</h2>

      <table className="border-collapse text-xs border border-gray-200">
        <thead>
          <tr>
            <th className="pr-2 text-gray-500 font-medium text-right w-10">Hour</th>
            {days.map((day) => (
              <th key={day} className="px-1 pb-2 text-center text-gray-600 font-medium min-w-[60px]">
                {formatDayLabel(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 24 }, (_, h) => {
            const hourKey = String(h);
            const rowData = heatmap.data[hourKey] ?? {};
            return (
              <tr key={h}>
                <td className="pr-2 text-right text-gray-500 font-mono">
                  {String(h).padStart(2, "0")}:00
                </td>
                {days.map((day) => {
                  const cell = rowData[day] ?? { count: 0 };
                  const isRainy = cell.isRainy ?? (typeof cell.rain === "number" && cell.rain > 0);
                  return (
                    <td key={day} className="p-[2px] border border-gray-200">
                      <div
                        title={`${formatDayLabel(day)} ${h}:00 — ${cell.count} events${isRainy ? " 🌧 rainy" : ""}`}
                        style={getCellStyle(cell.count, max)}
                        className={`w-[56px] h-6 rounded flex items-center justify-center font-semibold transition-opacity hover:opacity-80 cursor-default relative ${
                          cell.count > 0 ? "text-indigo-900" : "text-gray-300"
                        }`}
                      >
                        {cell.count > 0 ? cell.count : ""}
                        {isRainy && (
                          <span className="absolute top-0 right-0 text-[8px] leading-none">🌧</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span>Low</span>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const r = Math.round(255 - t * (255 - 79));
          const g = Math.round(255 - t * (255 - 70));
          const b = Math.round(255 - t * (255 - 229));
          return (
            <div
              key={t}
              className="w-6 h-4 rounded"
              style={{ backgroundColor: t === 0 ? "rgb(243,244,246)" : `rgb(${r},${g},${b})` }}
            />
          );
        })}
        <span>High</span>
        <span className="ml-4">🌧 = rainy hour</span>
      </div>
    </div>
  );
}
