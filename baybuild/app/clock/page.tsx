"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/lib/useLanguage";
import {
  getJobs,
  getWorkers,
  getWorkerByName,
  getTimeEntries,
  addTimeEntry,
  updateTimeEntry,
  calculateLaborCost,
} from "@/app/lib/db";

type JobRow = {
  id: string;
  name: string;
};

type WorkerRow = {
  id: string;
  name: string;
  pay_type?: string | null;
  hourly_rate?: number | null;
  annual_salary?: number | null;
  day_rate?: number | null;
};

type TimeEntryRow = {
  id: string;
  worker_name: string;
  job_id: string;
  job_name: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  labor_cost: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

export default function ClockPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [currentEntry, setCurrentEntry] = useState<TimeEntryRow | null>(null);
  const [lastHours, setLastHours] = useState<number | null>(null);
  const [lastLaborCost, setLastLaborCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const loadedJobs = await getJobs();
        const loadedWorkers = await getWorkers();
        const entries = await getTimeEntries();

        setJobs(Array.isArray(loadedJobs) ? loadedJobs : []);
        setWorkers(Array.isArray(loadedWorkers) ? loadedWorkers : []);

        if (loadedJobs?.length > 0) {
          setSelectedJobId(loadedJobs[0].id);
        }

        if (loadedWorkers?.length > 0) {
          setSelectedWorker(loadedWorkers[0].name);
        }

        const openEntry = entries.find(
          (entry: TimeEntryRow) => entry.clock_out === null
        );
        if (openEntry) setCurrentEntry(openEntry);

        const closedEntry = entries.find(
          (entry: TimeEntryRow) =>
            entry.clock_out !== null && entry.hours_worked !== null
        );
        if (closedEntry?.hours_worked !== null && closedEntry?.hours_worked !== undefined) {
          setLastHours(Number(closedEntry.hours_worked));
          setLastLaborCost(Number(closedEntry.labor_cost || 0));
        }
      } catch (error) {
        console.error("Clock page load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function clockIn() {
    const job = jobs.find((j) => j.id === selectedJobId);

    if (!job || !selectedWorker) {
      alert(t.addWorkerAndJobFirst);
      return;
    }

    const createEntry = async (
      latitude?: number | null,
      longitude?: number | null
    ) => {
      try {
        const entry = await addTimeEntry({
          worker_name: selectedWorker,
          job_id: job.id,
          job_name: job.name,
          clock_in: new Date().toISOString(),
          clock_out: null,
          hours_worked: null,
          labor_cost: null,
          latitude,
          longitude,
        });

        setCurrentEntry(entry);
        setLastHours(null);
        setLastLaborCost(null);
      } catch (error) {
        console.error("Clock in error:", error);
        alert("Clock in failed.");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => createEntry(pos.coords.latitude, pos.coords.longitude),
        () => createEntry(null, null)
      );
    } else {
      createEntry(null, null);
    }
  }

  async function clockOut() {
    if (!currentEntry) {
      alert(t.noActiveClockInFound);
      return;
    }

    try {
      const now = new Date();
      const hoursWorked =
        Math.round(
          ((now.getTime() - new Date(currentEntry.clock_in).getTime()) /
            3600000) *
            100
        ) / 100;

      const worker = await getWorkerByName(currentEntry.worker_name);

      const laborCost = calculateLaborCost(
        worker?.pay_type || "hourly",
        hoursWorked,
        Number(worker?.hourly_rate || 0),
        Number(worker?.annual_salary || 0),
        Number(worker?.day_rate || 0)
      );

      const updated = await updateTimeEntry(currentEntry.id, {
        clock_out: now.toISOString(),
        hours_worked: hoursWorked,
        labor_cost: laborCost,
      });

      setLastHours(Number(updated.hours_worked));
      setLastLaborCost(Number(updated.labor_cost || 0));
      setCurrentEntry(null);
    } catch (error) {
      console.error("Clock out error:", error);
      alert("Clock out failed.");
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">{t.loading}</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">{t.clock}</h1>

      <div className="card stack">
        <div className="grid-2">
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
          >
            <option value="">{t.selectWorker}</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.name}>
                {worker.name}
              </option>
            ))}
          </select>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">{t.selectJob}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <button onClick={clockIn}>{t.clockIn}</button>
          <button className="secondary" onClick={clockOut}>
            {t.clockOut}
          </button>
        </div>

        <div>
          <strong>{t.statusLabel}:</strong>{" "}
          {currentEntry ? `${t.clockedInOn} ${currentEntry.job_name}` : t.clockedOut}
        </div>

        {currentEntry && (
          <div>
            <strong>{t.clockInTime}:</strong>{" "}
            {new Date(currentEntry.clock_in).toLocaleString()}
          </div>
        )}

        {lastHours !== null && (
          <div>
            <strong>{t.lastHoursWorked}:</strong> {lastHours}
          </div>
        )}

        {lastLaborCost !== null && (
          <div>
            <strong>Labor Cost:</strong> ${lastLaborCost.toFixed(2)}
          </div>
        )}
      </div>
    </main>
  );
}