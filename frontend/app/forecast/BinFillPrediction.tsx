"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  defs,
  linearGradient,
  stop,
} from "recharts";
import { Clock, TrendingDown, Trash2, ArrowUp, AlertTriangle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProjectionPoint {
  offset_hours: number;
  timestamp: string;
  distance_cm: number;
  status: string;
  filledPct: number;
}

export interface EmptyingEvent {
  event: string;
  at: string;
  before_cm: number;
  after_cm: number;
  delta_cm: number;
}

export interface BinPrediction {
  threshold_cm: number;
  hours_until_threshold: number;
  predicted_at: string;
  fill_rate_cm_per_hour: number;
  r_squared: number;
  confidence: "high" | "moderate" | "low";
  model: string;
  data_points_used: number;
  note?: string;
  projection_points: ProjectionPoint[];
}

export interface BinData {
  bin_id: string;
  current_status: "EMPTY" | "NORMAL" | "ALMOST FULL" | "FULL" | "UNKNOWN";
  current_distance_cm: number;
  filled_pct: number;
  last_reading_at: string;
  post_emptying_state: boolean;
  post_emptying_reason?: string;
  note?: string;
  prediction: BinPrediction | null;
  emptying_events: EmptyingEvent[];
  data_points_used: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, { ring: string; text: string; bg: string }> = {
  EMPTY: { ring: "#22c55e", text: "text-green-600", bg: "bg-green-50" },
  NORMAL: { ring: "#3b82f6", text: "text-blue-600", bg: "bg-blue-50" },
  "ALMOST FULL": { ring: "#f59e0b", text: "text-amber-600", bg: "bg-amber-50" },
  FULL: { ring: "#ef4444", text: "text-red-600", bg: "bg-red-50" },
  UNKNOWN: { ring: "#9ca3af", text: "text-gray-500", bg: "bg-gray-100" },
};

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ─── Radial ring ─────────────────────────────────────────────────────────────

function RadialRing({ pct, color }: { pct: number; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(pct, 0), 100) / 100);
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={r} fill="none" stroke="#e5e7eb" strokeWidth={12} />
      <circle
        cx={70}
        cy={70}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={12}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-4">
        <div className="w-36 h-36 rounded-full bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="h-48 bg-gray-100 rounded" />
        <div className="mt-4 flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 flex-1 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ProjectionPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700">{fmtDateTime(d.timestamp)}</p>
      <p className="text-gray-600">Distance: {d.distance_cm.toFixed(1)} cm</p>
      <p className="text-gray-600">Status: {d.status}</p>
      <p className="text-gray-600">Fill: {d.filledPct}%</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BinFillPrediction({ data }: { data: BinData | null }) {
  if (!data) return <Skeleton />;

  const statusStyle = STATUS_COLOR[data.current_status] ?? STATUS_COLOR.UNKNOWN;
  const pred = data.prediction;

  return (
    <div className="space-y-5">
      {/* ── Status card ── */}
      <div className="bg-white rounded-xl shadow p-6">
        {data.post_emptying_state ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="text-6xl">🗑️</div>
            <p className="text-lg font-bold text-gray-700">Bin Recently Emptied</p>
            {data.note && <p className="text-sm text-gray-500 max-w-xs">{data.note}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-1">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <RadialRing pct={data.filled_pct} color={statusStyle.ring} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-sm font-bold ${statusStyle.text}`}>
                  {data.current_status}
                </span>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-800 mt-1">
              {data.filled_pct.toFixed(1)}% full
            </p>
            <p className="text-sm text-gray-500">
              Distance: {data.current_distance_cm.toFixed(1)} cm
            </p>
            <p className="text-xs text-gray-400">
              Updated {relativeTime(data.last_reading_at)}
            </p>
          </div>
        )}
      </div>

      {/* ── Prediction panel ── */}
      {pred === null ? (
        <div className="bg-gray-100 rounded-xl p-6 border border-dashed border-gray-300">
          <p className="text-sm text-gray-500 font-medium text-center">
            {data.note ?? "Prediction unavailable"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Fill Level Forecast</h3>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={pred.projection_points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="offset_hours"
                label={{ value: "Hours from now", position: "insideBottomRight", offset: -8, fontSize: 10 }}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(v) => `+${v}h`}
              />
              <YAxis
                domain={[0, 110]}
                reversed={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(v) => `${v}`}
                label={{ value: "Distance (cm)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* Threshold reference lines */}
              <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 3" label={{ value: "Empty", position: "right", fontSize: 9, fill: "#22c55e" }} />
              <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 3" label={{ value: "Normal", position: "right", fontSize: 9, fill: "#3b82f6" }} />
              <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: "Almost Full", position: "right", fontSize: 9, fill: "#f59e0b" }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 3" label={{ value: "Full", position: "right", fontSize: 9, fill: "#ef4444" }} />

              {/* Predicted emptying time vertical line */}
              <ReferenceLine
                x={pred.hours_until_threshold}
                stroke="#6366f1"
                strokeDasharray="4 3"
                label={{
                  value: `⚠ ${fmtDateTime(pred.predicted_at)}`,
                  position: "top",
                  fontSize: 9,
                  fill: "#6366f1",
                }}
              />

              <Line
                type="monotone"
                dataKey="distance_cm"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <Clock size={14} className="text-indigo-500" />
              <span className="font-semibold text-gray-700">
                Emptying in {pred.hours_until_threshold.toFixed(1)} hrs
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <TrendingDown size={14} className="text-red-400" />
              <span className="font-semibold text-gray-700">
                {pred.fill_rate_cm_per_hour.toFixed(3)} cm/hr fill rate
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${CONFIDENCE_STYLE[pred.confidence] ?? CONFIDENCE_STYLE.low}`}
            >
              Confidence: {pred.confidence}
            </div>
          </div>

          {/* Prediction note warning */}
          {pred.note && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{pred.note}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Emptying events ── */}
      {data.emptying_events.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Emptying Events</h3>
          <ul className="space-y-3">
            {data.emptying_events.map((ev, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Trash2 size={14} className="text-indigo-500" />
                  <ArrowUp size={10} className="text-indigo-500 -ml-1 -mt-2" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Emptied at {fmtDateTime(ev.at)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Level: {ev.before_cm.toFixed(1)} cm → {ev.after_cm.toFixed(1)} cm
                    <span className="text-indigo-500 font-medium ml-1">
                      (Δ {ev.delta_cm.toFixed(1)} cm)
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
