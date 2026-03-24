"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile, type Profile } from "@/app/lib/profile";
import { useLanguage } from "@/app/lib/useLanguage";

type WorkerStats = {
  openClockIns: number;
  reportsToday: number;
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function WorkerPage() {
  const { t } = useLanguage();
  const tx = t as Record<string, string | undefined>;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<WorkerStats>({
    openClockIns: 0,
    reportsToday: 0,
  });

  const copy = useMemo(
    () => ({
      title: tx.workerDashboard || "Worker Dashboard",
      subtitle:
        tx.workerDashboardSubtitle ||
        "Quick access to clock in, reports, time entries, and field tools.",
      welcome: tx.workerWelcome || "Welcome",
      openClockIns: tx.openClockIns || "Open Clock-ins",
      dailyReports: tx.dailyReports || "Daily Reports",
      clockArea: tx.clockArea || "Clock In / Out",
      reportsArea: tx.reports || "Reports",
      timeEntries: tx.timeEntries || "Time Entries",
      jobs: tx.jobs || "Jobs",
      projects: tx.projects || "Projects",
      loading: tx.loading || "Loading...",
      loggedInAs: tx.loggedInAs || "Logged in as",
      role: tx.role || "Role",
      company: tx.company || "Company",
      open: tx.open || "Open",
      submitDailyReport: tx.submitDailyReport || "Submit Daily Report",
      noRole: tx.noRole || "No role",
      noCompany: tx.noCompany || "No company",
      dashboard: tx.dashboard || "Dashboard",
      logout: tx.logout || "Logout",
      workerTools: tx.workerTools || "Worker Tools",
      todaySnapshot: tx.todaySnapshot || "Today’s Snapshot",
      goToClock: tx.goToClock || "Go to clock",
      goToReports: tx.goToReports || "Go to reports",
      reviewTimeEntries: tx.reviewTimeEntries || "Review time entries",
    }),
    [tx]
  );

  useEffect(() => {
    async function loadWorkerPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const myProfile = await ensureProfile();

      if (!myProfile) {
        window.location.href = "/login";
        return;
      }

      setProfile(myProfile);

      const today = todayDateString();

      const [clockRes, reportRes] = await Promise.all([
        supabase
          .from("time_entries")
          .select("id", { count: "exact", head: true })
          .eq("worker_id", user.id)
          .is("clock_out", null),
        supabase
          .from("daily_reports")
          .select("id", { count: "exact", head: true })
          .eq("worker_id", user.id)
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`),
      ]);

      setStats({
        openClockIns: Number(clockRes.count || 0),
        reportsToday: Number(reportRes.count || 0),
      });

      setLoading(false);
    }

    loadWorkerPage();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="page-shell">
        <main className="page">
          <div className="card">{copy.loading}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
            <div>
              <div className="brand">CrewTraxk</div>
              <div className="muted" style={{ marginTop: 6 }}>
                {copy.loggedInAs} {profile?.email || ""}
              </div>
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="secondary-button">
                {copy.dashboard}
              </Link>
              <button className="secondary-button" onClick={logout}>
                {copy.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="page stack">
        <section className="hero">
          <div className="hero-copy">
            <h1 className="title">
              {copy.welcome}
              {profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="hero-blurb">{copy.subtitle}</p>

            <div className="hero-pills">
              <span className="pill">
                {copy.role}: {profile?.role || copy.noRole}
              </span>
              <span className="pill">
                {copy.company}: {profile?.company_name || copy.noCompany}
              </span>
            </div>
          </div>
        </section>

        <section className="grid-auto">
          <div className="card metric-card">
            <div className="metric-label">{copy.openClockIns}</div>
            <div className="kpi">{stats.openClockIns}</div>
            <div className="metric-subtle">Current open time entries</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{copy.dailyReports}</div>
            <div className="kpi">{stats.reportsToday}</div>
            <div className="metric-subtle">Submitted today</div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">{copy.workerTools}</h2>

            <div className="link-list">
              <Link href="/clock" className="link-tile">
                <span>{copy.goToClock}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/reports" className="link-tile">
                <span>{copy.goToReports}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/time-admin" className="link-tile">
                <span>{copy.reviewTimeEntries}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/jobs" className="link-tile">
                <span>{copy.jobs}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/projects" className="link-tile">
                <span>{copy.projects}</span>
                <span className="muted">{copy.open}</span>
              </Link>
            </div>
          </div>

          <div className="card stack">
            <h2 className="section-title">{copy.todaySnapshot}</h2>

            <div className="info-block">
              <strong>{copy.clockArea}</strong>
              <p>Clock in and out, then review your time for the day.</p>
            </div>

            <div className="info-block">
              <strong>{copy.reportsArea}</strong>
              <p>{copy.submitDailyReport}</p>
            </div>

            <div className="info-block">
              <strong>{copy.timeEntries}</strong>
              <p>Review your recorded hours and entries.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}