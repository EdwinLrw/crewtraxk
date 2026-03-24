"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [userEmail, setUserEmail] = useState("");

  const recentJobs = useMemo(() => jobs.slice(-5).reverse(), [jobs]);
  const recentWorkers = useMemo(() => workers.slice(-5).reverse(), [workers]);
  const recentReports = useMemo(() => reports.slice(-5).reverse(), [reports]);
  const recentInvoices = useMemo(() => invoices.slice(-5).reverse(), [invoices]);
  const recentInspections = useMemo(
    () => inspections.slice(-5).reverse(),
    [inspections]
  );
  const recentTimeEntries = useMemo(
    () => timeEntries.slice(-5).reverse(),
    [timeEntries]
  );

  const unpaidInvoicesCount = useMemo(
    () => invoices.filter((invoice) => invoice.status !== "paid").length,
    [invoices]
  );

  const openTimeEntriesCount = useMemo(
    () => timeEntries.filter((entry) => !entry.clockOut).length,
    [timeEntries]
  );

  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="page-shell">
        <main className="page">
          <div className="card">{t.loading}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div
            className="row"
            style={{ justifyContent: "space-between", width: "100%" }}
          >
            <div>
              <div className="brand">CrewTraxk</div>
              <div className="muted" style={{ marginTop: 6 }}>
                {t.loggedInAs} {userEmail}
              </div>
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="secondary-button">
                {t.dashboard}
              </Link>
              <Link href="/workers" className="secondary-button">
                {t.workers}
              </Link>
              <Link href="/jobs" className="secondary-button">
                {t.jobs}
              </Link>
              <button className="secondary-button" onClick={handleLogout}>
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="page stack">
        <section className="hero">
          <div className="hero-copy">
            <h1 className="title">Admin Control Center</h1>
            <p className="hero-blurb">
              Manage your company activity, review team data, track open items,
              and jump into the most important areas fast.
            </p>

            <div className="hero-pills">
              <span className="pill">
                {t.jobs}: {jobs.length}
              </span>
              <span className="pill">
                {t.workers}: {workers.length}
              </span>
              <span className="pill">
                {t.invoices}: {invoices.length}
              </span>
              <span className="pill">
                {t.inspections}: {inspections.length}
              </span>
            </div>
          </div>
        </section>

        <section className="grid-auto">
          <div className="card metric-card">
            <div className="metric-label">{t.jobs}</div>
            <div className="kpi">{jobs.length}</div>
            <div className="metric-subtle">Total jobs in system</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{t.workers}</div>
            <div className="kpi">{workers.length}</div>
            <div className="metric-subtle">Total workers added</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{t.timeEntries}</div>
            <div className="kpi">{timeEntries.length}</div>
            <div className="metric-subtle">All recorded time entries</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{t.reports}</div>
            <div className="kpi">{reports.length}</div>
            <div className="metric-subtle">Daily reports submitted</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Open Time Entries</div>
            <div className="kpi">{openTimeEntriesCount}</div>
            <div className="metric-subtle">Workers still clocked in</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Unpaid Invoices</div>
            <div className="kpi">{unpaidInvoicesCount}</div>
            <div className="metric-subtle">Invoices not marked paid</div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">Quick Actions</h2>

            <div className="link-list">
              <Link href="/workers" className="link-tile">
                <span>Manage workers</span>
                <span className="muted">Open</span>
              </Link>

              <Link href="/jobs" className="link-tile">
                <span>Manage jobs</span>
                <span className="muted">Open</span>
              </Link>

              <Link href="/reports" className="link-tile">
                <span>Review reports</span>
                <span className="muted">Open</span>
              </Link>

              <Link href="/invoices" className="link-tile">
                <span>Review invoices</span>
                <span className="muted">Open</span>
              </Link>

              <Link href="/inspections" className="link-tile">
                <span>Review inspections</span>
                <span className="muted">Open</span>
              </Link>

              <Link href="/time-admin" className="link-tile">
                <span>Review time entries</span>
                <span className="muted">Open</span>
              </Link>
            </div>
          </div>

          <div className="card stack">
            <h2 className="section-title">Admin Snapshot</h2>

            <div className="info-block">
              <strong>Jobs</strong>
              <p>
                {jobs.length === 0
                  ? "No jobs added yet."
                  : `You currently have ${jobs.length} job${jobs.length === 1 ? "" : "s"} in the system.`}
              </p>
            </div>

            <div className="info-block">
              <strong>Workers</strong>
              <p>
                {workers.length === 0
                  ? "No workers added yet."
                  : `You currently have ${workers.length} worker${workers.length === 1 ? "" : "s"} in the system.`}
              </p>
            </div>

            <div className="info-block">
              <strong>Invoices</strong>
              <p>
                {unpaidInvoicesCount === 0
                  ? "All invoices are marked paid."
                  : `You have ${unpaidInvoicesCount} unpaid invoice${unpaidInvoicesCount === 1 ? "" : "s"} to review.`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">{t.jobs}</h2>
            {recentJobs.length === 0 ? (
              <div className="muted">No jobs yet.</div>
            ) : (
              <div className="link-list">
                {recentJobs.map((job) => (
                  <div key={job.id} className="info-block">
                    <strong>{job.name}</strong>
                    <p>
                      {job.client || t.noClient}
                      {job.address ? ` • ${job.address}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <h2 className="section-title">{t.workers}</h2>
            {recentWorkers.length === 0 ? (
              <div className="muted">No workers yet.</div>
            ) : (
              <div className="link-list">
                {recentWorkers.map((worker) => (
                  <div key={worker.id} className="info-block">
                    <strong>{worker.name}</strong>
                    <p>{worker.role || t.noRole}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">{t.timeEntries}</h2>
            {recentTimeEntries.length === 0 ? (
              <div className="muted">No time entries yet.</div>
            ) : (
              <div className="link-list">
                {recentTimeEntries.map((entry) => (
                  <div key={entry.id} className="info-block">
                    <strong>
                      {entry.workerName} — {entry.jobName}
                    </strong>
                    <p>
                      {t.hoursWorked}: {entry.hoursWorked ?? "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <h2 className="section-title">{t.reports}</h2>
            {recentReports.length === 0 ? (
              <div className="muted">No reports yet.</div>
            ) : (
              <div className="link-list">
                {recentReports.map((report) => (
                  <div key={report.id} className="info-block">
                    <strong>
                      {report.jobName} — {report.workerName}
                    </strong>
                    <p>{report.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">{t.invoices}</h2>
            {recentInvoices.length === 0 ? (
              <div className="muted">No invoices yet.</div>
            ) : (
              <div className="link-list">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="info-block">
                    <strong>{invoice.jobName}</strong>
                    <p>
                      ${invoice.amount} • {invoice.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <h2 className="section-title">{t.inspections}</h2>
            {recentInspections.length === 0 ? (
              <div className="muted">No inspections yet.</div>
            ) : (
              <div className="link-list">
                {recentInspections.map((inspection) => (
                  <div key={inspection.id} className="info-block">
                    <strong>{inspection.jobName}</strong>
                    <p>
                      {inspection.inspectionType} • {inspection.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}