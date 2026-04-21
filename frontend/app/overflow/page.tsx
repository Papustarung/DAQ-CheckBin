"use client";

import OverflowChartCard, { THRESHOLD_EMPTY, THRESHOLD_NORMAL, THRESHOLD_ALMOST_FULL } from "@/app/dashboard/OverflowChartCard";

export default function OverflowPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Overflow Risk Analysis</h1>
          <a href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Dashboard
          </a>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Fill level over time · threshold zones · PIR activity · auto-detected emptying events
        </p>

        <OverflowChartCard />

        {/* Zone legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
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
      </div>
    </main>
  );
}
