"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Inspection,
  Invoice,
  Job,
  Report,
  TimeEntry,
  Worker,
  store,
} from "@/app/lib/storage";
import { supabase } from "@/app/lib/supabase";
import { useLanguage } from "@/app/lib/useLanguage";
import { ensureProfile } from "@/app/lib/profile";
import { canViewAdmin } from "@/app/lib/permissions";

export default function AdminPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await ensureProfile();

      if (!profile || !canViewAdmin(profile.role)) {
        router.push("/worker");
        return;
      }

      setJobs(store.getJobs());
      setWorkers(store.getWorkers());
      setTimeEntries(store.getTimeEntries());
      setReports(store.getReports());
      setInvoices(store.getInvoices());
      setInspections(store.getInspections());
      setLoading(false);
    }

    loadAdmin();
  }, [router]);

  if (loading) {
    return (
      <main className="page">
        <div className="card">{t.loading}</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">{t.admin}</h1>

      <div className="card stack">
        <h2 className="section-title">{t.jobs}</h2>
        {jobs.map((job) => (
          <div key={job.id}>
            {job.name} — {job.client || t.noClient}
          </div>
        ))}
      </div>

      <div className="card stack">
        <h2 className="section-title">{t.workers}</h2>
        {workers.map((worker) => (
          <div key={worker.id}>
            {worker.name} — {worker.role || t.noRole}
          </div>
        ))}
      </div>

      <div className="card stack">
        <h2 className="section-title">{t.timeEntries}</h2>
        {timeEntries.map((entry) => (
          <div key={entry.id}>
            {entry.workerName} — {entry.jobName} — {t.hoursWorked}:{" "}
            {entry.hoursWorked ?? "-"}
          </div>
        ))}
      </div>

      <div className="card stack">
        <h2 className="section-title">{t.reports}</h2>
        {reports.map((report) => (
          <div key={report.id}>
            {report.jobName} — {report.workerName} — {report.date}
          </div>
        ))}
      </div>

      <div className="card stack">
        <h2 className="section-title">{t.invoices}</h2>
        {invoices.map((invoice) => (
          <div key={invoice.id}>
            {invoice.jobName} — ${invoice.amount} — {invoice.status}
          </div>
        ))}
      </div>

      <div className="card stack">
        <h2 className="section-title">{t.inspections}</h2>
        {inspections.map((inspection) => (
          <div key={inspection.id}>
            {inspection.jobName} — {inspection.inspectionType} — {inspection.status}
          </div>
        ))}
      </div>
    </main>
  );
}