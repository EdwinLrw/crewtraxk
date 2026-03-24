"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/lib/useLanguage";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";
import { canViewJobs } from "@/app/lib/permissions";
import { addJob, deleteJob, getJobs } from "@/app/lib/db";

type JobRow = {
  id: string;
  name: string;
  address: string | null;
  client: string | null;
  start_date: string | null;
  status: string | null;
};

export default function JobsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    address: "",
    client: "",
    startDate: "",
    status: "Active",
  });

  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await ensureProfile();

      if (!profile || !canViewJobs(profile.role)) {
        router.push("/worker");
        return;
      }

      const data = await getJobs();
      setJobs(data);
      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddJob() {
    if (!form.name.trim()) return;

    const created = await addJob({
      name: form.name,
      address: form.address,
      client: form.client,
      start_date: form.startDate,
      status: form.status,
    });

    setJobs((prev) => [created, ...prev]);
    setForm({
      name: "",
      address: "",
      client: "",
      startDate: "",
      status: "Active",
    });
  }

  async function handleDeleteJob(id: string) {
    await deleteJob(id);
    setJobs((prev) => prev.filter((job) => job.id !== id));
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
      <h1 className="title">{t.jobs}</h1>

      <div className="card stack">
        <div className="grid-2">
          <input
            placeholder={t.jobName}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder={t.address}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            placeholder={t.clientName}
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>

        <div>
          <button onClick={handleAddJob}>{t.addJob}</button>
        </div>
      </div>

      <div className="list">
        {jobs.map((job) => (
          <div key={job.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{job.name}</strong>
              <span className="badge">{job.status || "Active"}</span>
            </div>

            <div>
              <strong>{t.address}:</strong> {job.address || "-"}
            </div>

            <div>
              <strong>{t.clientName}:</strong> {job.client || "-"}
            </div>

            <div>
              <strong>{t.startDate}:</strong> {job.start_date || "-"}
            </div>

            <div>
              <button className="danger" onClick={() => handleDeleteJob(job.id)}>
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}