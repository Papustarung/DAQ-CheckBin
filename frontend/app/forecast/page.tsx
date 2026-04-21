"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import BinFillPrediction, { BinData } from "./BinFillPrediction";

export default function ForecastPage() {
  const [data, setData] = useState<BinData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/backend/prediction/empty")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return (
    <>
      <Navbar active="/forecast" />
      <main className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Bin Fill Forecast</h1>
          {error ? (
            <p className="text-red-500 text-sm">Failed to load prediction data.</p>
          ) : (
            <BinFillPrediction data={data} />
          )}
        </div>
      </main>
    </>
  );
}