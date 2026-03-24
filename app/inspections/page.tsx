"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/lib/useLanguage";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";
import { canViewInspections } from "@/app/lib/permissions";
import { addInspection, getInspections, getJobs } from "@/app/lib/db";

type JobRow = {
  id: string;
  name: string;
};

type InspectionRow = {
  id: string;
  job_id: string;
  job_name: string;
  inspection_type: string | null;
  date: string | null;
  status: string | null;
  notes: string | null;
};

export default function InspectionsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    jobId: "",
    inspectionType: "Plumbing",
    date: "",
    status: "Scheduled",
    notes: "",
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

      if (!profile || !canViewInspections(profile.role)) {
        router.push("/worker");
        return;
      }

      const loadedJobs = await getJobs();
      const loadedInspections = await getInspections();

      setJobs(loadedJobs);
      setInspections(loadedInspections);

      if (loadedJobs.length > 0) {
        setForm((prev) => ({
          ...prev,
          jobId: loadedJobs[0].id,
        }));
      }

      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddInspection() {
    const job = jobs.find((j) => j.id === form.jobId);

    if (!job) {
      alert(t.selectAJob);
      return;
    }

    const created = await addInspection({
      job_id: job.id,
      job_name: job.name,
      inspection_type: form.inspectionType,
      date: form.date,
      status: form.status,
      notes: form.notes,
    });

    setInspections((prev) => [created, ...prev]);

    setForm((prev) => ({
      ...prev,
      date: "",
      notes: "",
    }));
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
      <h1 className="title">{t.inspections}</h1>

      <div className="card stack">
        <div className="grid-2">
          <select
            value={form.jobId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, jobId: e.target.value }))
            }
          >
            <option value="">{t.selectJob}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>

          <select
            value={form.inspectionType}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                inspectionType: e.target.value,
              }))
            }
          >
            <option value="Plumbing">{t.plumbing}</option>
            <option value="Electrical">{t.electrical}</option>
            <option value="Final">{t.inspectionFinal}</option>
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, date: e.target.value }))
            }
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="Scheduled">{t.scheduled}</option>
            <option value="Passed">{t.passed}</option>
            <option value="Failed">{t.failed}</option>
            <option value="Pending">{t.pending}</option>
          </select>
        </div>

        <textarea
          placeholder={t.notes}
          value={form.notes}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />

        <div>
          <button onClick={handleAddInspection}>{t.addInspection}</button>
        </div>
      </div>

      <div className="list">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{inspection.job_name}</strong>
              <span className="badge">{inspection.status}</span>
            </div>

            <div>
              <strong>{t.type}:</strong> {inspection.inspection_type}
            </div>

            <div>
              <strong>{t.dueDate}:</strong> {inspection.date || "-"}
            </div>

            <div>
              <strong>{t.notes}:</strong> {inspection.notes || "-"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}