"use client";

import HumidityChartCard from "@/app/dashboard/HumidityChartCard";

function CorrelationCallout({
  label,
  r,
  color,
}: {
  label: string;
  r: number;
  color: string;
}) {
  const abs = Math.abs(r);
  const strength =
    abs >= 0.7 ? "Strong" : abs >= 0.4 ? "Moderate" : abs >= 0.2 ? "Weak" : "Negligible";
  const direction = r >= 0 ? "positive" : "negative";
  return (
    <div className={`border-l-4 ${color} bg-white rounded shadow-sm p-4 min-w-[160px]`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">
        {r >= 0 ? "+" : ""}
        {r.toFixed(2)}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {strength} {direction} correlation
      </p>
    </div>
  );
}

export default function HumidityBinUsagePage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Rain & Humidity vs Bin Usage</h1>
          <a href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Dashboard
          </a>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          PIR activity (bars) vs. weather (line) · Pearson r computed server-side
        </p>
        <HumidityChartCard />
      </div>
    </main>
  );
}
