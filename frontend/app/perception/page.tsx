"use client";

import { useEffect, useState } from "react";

interface PerceptionData {
  summary: {
    realityScore: number;
    perceptionScore: number;
    satisfaction: string;
    totalResponses: number;
  };
  narrative: {
    title: string;
    value: number;
    analysis: string;
  };
}

function ScoreBar({
  label,
  pct,
  color,
  sublabel,
}: {
  label: string;
  pct: number;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="flex-1 min-w-[140px]">
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      <div className="relative h-5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-1">{pct}%</p>
      {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-xl ${score >= s ? "text-yellow-400" : score >= s - 0.5 ? "text-yellow-300" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function PerceptionPage() {
  const [data, setData] = useState<PerceptionData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/backend/perception")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error)
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <p className="text-red-500">Failed to load perception data.</p>
      </main>
    );

  if (!data)
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <p className="text-gray-400 animate-pulse">Loading…</p>
      </main>
    );

  const { summary, narrative } = data;
  const gap = narrative.value;
  const gapPositive = gap > 0;
  const satisfactionNum = parseFloat(summary.satisfaction);

  // Gap interpretation
  const gapColor =
    Math.abs(gap) >= 30
      ? "text-red-600"
      : Math.abs(gap) >= 15
      ? "text-orange-500"
      : "text-green-600";

  const gapBg =
    Math.abs(gap) >= 30
      ? "bg-red-50 border-red-200"
      : Math.abs(gap) >= 15
      ? "bg-orange-50 border-orange-200"
      : "bg-green-50 border-green-200";

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Perception vs. Reality
            </h1>
            <a href="/dashboard" className="text-sm text-indigo-600 hover:underline">
              ← Dashboard
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            Do user complaints match actual monitored bin conditions?
          </p>
        </div>

        {/* Score comparison */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Overflow Reports vs Sensor Data
          </h2>
          <div className="flex flex-wrap gap-8">
            <ScoreBar
              label="Sensor Reality"
              pct={summary.realityScore}
              color="bg-indigo-500"
              sublabel="% of readings showing FULL (dist 12–45 cm)"
            />
            <ScoreBar
              label="User Perception"
              pct={summary.perceptionScore}
              color="bg-amber-400"
              sublabel={`% of ${summary.totalResponses} respondents reported overflow`}
            />
          </div>

          {/* Gap callout */}
          <div className={`mt-6 p-4 rounded-lg border ${gapBg}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Perception Gap
            </p>
            <p className={`text-4xl font-black ${gapColor}`}>
              {gapPositive ? "+" : ""}
              {gap}%
            </p>
            <p className="text-sm text-gray-600 mt-1">{narrative.analysis}</p>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Cleanliness Satisfaction
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-5xl font-black text-gray-800">{summary.satisfaction}</p>
            <div>
              <StarRating score={satisfactionNum} />
              <p className="text-xs text-gray-400 mt-1">out of 5.0 · {summary.totalResponses} responses</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {satisfactionNum >= 4
              ? "Users are generally satisfied with cleanliness."
              : satisfactionNum >= 3
              ? "Satisfaction is moderate — room for improvement."
              : "Low satisfaction score. Cleaning frequency may need review."}
          </p>
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Summary Comparison Table
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2 border border-gray-200 font-medium">Metric</th>
                <th className="px-4 py-2 border border-gray-200 font-medium text-indigo-600">
                  Sensor (Reality)
                </th>
                <th className="px-4 py-2 border border-gray-200 font-medium text-amber-600">
                  Survey (Perception)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  Overflow / Full rate
                </td>
                <td className="px-4 py-3 border border-gray-200 font-semibold text-indigo-700">
                  {summary.realityScore}% of readings
                </td>
                <td className="px-4 py-3 border border-gray-200 font-semibold text-amber-700">
                  {summary.perceptionScore}% of respondents
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  Data source
                </td>
                <td className="px-4 py-3 border border-gray-200 text-gray-500">
                  ToF distance sensor (filtered: lid-closed excluded)
                </td>
                <td className="px-4 py-3 border border-gray-200 text-gray-500">
                  User survey ({summary.totalResponses} responses)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  Satisfaction score
                </td>
                <td className="px-4 py-3 border border-gray-200 text-gray-400">N/A</td>
                <td className="px-4 py-3 border border-gray-200 font-semibold text-amber-700">
                  {summary.satisfaction} / 5.0
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 border border-gray-200 text-gray-700">
                  Perception gap
                </td>
                <td
                  colSpan={2}
                  className={`px-4 py-3 border border-gray-200 font-bold text-center ${gapColor}`}
                >
                  {gapPositive ? "+" : ""}
                  {gap}%{" "}
                  <span className="font-normal text-gray-500">
                    ({gapPositive ? "users overestimate fullness" : "sensor shows more fullness than reported"})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
