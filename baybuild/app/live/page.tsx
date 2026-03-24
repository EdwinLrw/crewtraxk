"use client";

import { useEffect, useState } from "react";
import { getLiveClockedInWorkers } from "@/app/lib/projects-db";

type LiveRow = {
  id: string;
  worker_name: string;
  job_name: string;
  clock_in: string;
};

export default function LivePage() {
  const [data, setData] = useState<LiveRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const d = await getLiveClockedInWorkers();
      setData(d);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="page">
        <div className="card">Loading live crew...</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">Live Crew</h1>

      {data.length === 0 ? (
        <div className="card">
          No one is clocked in right now.
        </div>
      ) : (
        data.map((row) => (
          <div key={row.id} className="card">
            <strong>{row.worker_name}</strong>
            <div>{row.job_name}</div>
            <div>{new Date(row.clock_in).toLocaleString()}</div>
          </div>
        ))
      )}
    </main>
  );
}