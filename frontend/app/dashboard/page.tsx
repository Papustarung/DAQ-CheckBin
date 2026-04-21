"use client";

import React from "react";
import { useEffect, useState } from "react";
import HeatmapCard from "./HeatmapCard";
import OverflowChartCard from "./OverflowChartCard";
import HumidityChartCard from "./HumidityChartCard";
import Navbar from "@/app/components/Navbar";

export default function DashboardPage() {

  const [data, setData] = useState({
    binId: "checkbin_02",
    status: "UNKNOWN",
    percent: 0,
    displayStatus: "UNKNOWN (0% Full)",
    rawDistance: "0 cm",
    lastActivity: 0,
    weather: "0°C, 0% humidity"
});

  useEffect(() => {
    fetch("/api/backend/status")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setData({
          binId: "checkbin_02",
          status: "ERROR",
          percent: 0,
          displayStatus: "ERROR (0% Full)",
          rawDistance: "0 cm",
          lastActivity: 0,
          weather: "0°C, 0% humidity"
        });
      });
  }, []);

  const statusColor: Record<string, string> = {
    "UNKNOWN": "bg-purple-500",
    "FULL": "bg-red-500",
    "ALMOST FULL": "bg-orange-500",
    "NORMAL": "bg-yellow-400",
    "EMPTY": "bg-green-500",
    "ERROR": "bg-gray-500",
  };

  const colorClass = statusColor[data.status] ?? "bg-gray-500";

  return (
    <>
    <Navbar active="/dashboard" />
    <main className="min-h-screen p-8">
      <div className="bg-gray-100 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Status Dashboard</h1>
        <div className="flex flex-row items-center space-x-4">
          <p className="text-gray-700 font-semibold">Latest Status</p>
          <p className={`${colorClass} text-white p-2 rounded w-[150px] text-center font-bold`}>{data.status}</p>
          <p className="text-gray-700 font-semibold">{data.status !== "UNKNOWN" ? data.displayStatus : ""}</p>
        </div>
        <p className="text-gray-700 font-semibold">Last Activity: {Math.floor(data.lastActivity / 60) > 0 ? `${Math.floor(data.lastActivity / 60)} hours ago` : ""} {data.lastActivity % 60} minutes ago</p>
        <p className="text-gray-700 font-semibold">Weather: {data.weather}</p>
      </div>
      <div className="mt-6">
        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Overflow Risk</h2>
            <a href="/overflow" className="text-sm text-indigo-600 hover:underline">
              View full analysis →
            </a>
          </div>
          <OverflowChartCard compact />
        </div>
      </div>
      <div className="mt-6">
        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Humidity & Rain vs Bin Usage</h2>
            <a href="/humidity-bin-usage" className="text-sm text-indigo-600 hover:underline">
              View full analysis →
            </a>
          </div>
          <HumidityChartCard compact />
        </div>
      </div>
      <div className="mt-6">
        <a
          href="/perception"
          className="flex items-center justify-between bg-gray-100 rounded-lg shadow-md p-6 hover:bg-indigo-50 transition-colors group"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700">
              Perception vs. Reality
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Do user complaints match actual monitored bin conditions?
            </p>
          </div>
          <span className="text-indigo-600 text-sm font-medium group-hover:underline">
            View analysis →
          </span>
        </a>
      </div>
      <div className="mt-6">
        <HeatmapCard />
      </div>
    </main>
    </>
  );
}
