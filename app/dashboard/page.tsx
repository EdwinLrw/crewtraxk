"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile, type Profile } from "@/app/lib/profile";
import { useLanguage } from "@/app/lib/useLanguage";

type DashboardStats = {
  workers: number;
  jobs: number;
  invoicesOpen: number;
  projects: number;
  paymentRequests: number;
  subcontractorIssues: number;
};

function safeCount(value: number | null | undefined) {
  return Number(value || 0);
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const tx = t as Record<string, string | undefined>;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    workers: 0,
    jobs: 0,
    invoicesOpen: 0,
    projects: 0,
    paymentRequests: 0,
    subcontractorIssues: 0,
  });

  const copy = useMemo(
    () => ({
      title: tx.dashboard || "Dashboard",
      welcome: tx.dashboardWelcome || "Welcome back",
      subtitle:
        tx.dashboardSubtitle ||
        "Track your crew, jobs, invoices, reports, and operations from one place.",
      teamOverview: tx.teamOverview || "Team Overview",
      operationsOverview: tx.operationsOverview || "Operations Overview",
      quickActions: tx.quickActions || "Quick Actions",
      recentSetup: tx.recentSetup || "Next Best Steps",
      workers: tx.workers || "Workers",
      jobs: tx.jobs || "Jobs",
      projects: tx.projects || "Projects",
      invoices: tx.invoices || "Invoices",
      paymentRequests: tx.paymentRequests || "Payment Requests",
      subcontractorIssues: tx.subcontractorIssues || "Compliance Issues",
      open: tx.open || "Open",
      manageWorkers: tx.manageWorkers || "Manage workers",
      manageJobs: tx.manageJobs || "Manage jobs",
      reviewInvoices: tx.reviewInvoices || "Review invoices",
      openProjects: tx.openProjects || "Open projects",
      paymentApprovals: tx.paymentApprovals || "Payment approvals",
      subcontractorCompliance:
        tx.subcontractorCompliance || "Subcontractor compliance",
      adminCenter: tx.adminCenter || "Admin Center",
      payrollArea: tx.payrollArea || "Payroll area",
      reportsArea: tx.reportsArea || "Reports area",
      workerArea: tx.workerArea || "Worker view",
      companySetup: tx.companySetup || "Company setup",
      companySetupText:
        tx.companySetupText ||
        "Add workers, create jobs, and start using reports and payroll tools.",
      roleLabel: tx.role || "Role",
      companyLabel: tx.company || "Company",
      logout: tx.logout || "Logout",
      loading: tx.loading || "Loading...",
      loggedInAs: tx.loggedInAs || "Logged in as",
      noRole: tx.noRole || "No role",
      noCompany: tx.noCompany || "No company",
    }),
    [tx]
  );

  useEffect(() => {
    async function loadDashboard() {
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

      const [
        workersRes,
        jobsRes,
        invoicesRes,
        projectsRes,
        paymentRequestsRes,
        subcontractorsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "worker"),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }).neq("status", "paid"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("subcontractors").select("id", { count: "exact", head: true }).or("w9_on_file.eq.false,insurance_on_file.eq.false"),
      ]);

      setStats({
        workers: safeCount(workersRes.count),
        jobs: safeCount(jobsRes.count),
        invoicesOpen: safeCount(invoicesRes.count),
        projects: safeCount(projectsRes.count),
        paymentRequests: safeCount(paymentRequestsRes.count),
        subcontractorIssues: safeCount(subcontractorsRes.count),
      });

      setLoading(false);
    }

    loadDashboard();
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
              <Link href="/worker" className="secondary-button">
                {copy.workerArea}
              </Link>
              <Link href="/admin" className="secondary-button">
                {copy.adminCenter}
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
                {copy.roleLabel}: {profile?.role || copy.noRole}
              </span>
              <span className="pill">
                {copy.companyLabel}: {profile?.company_name || copy.noCompany}
              </span>
            </div>
          </div>
        </section>

        <section className="grid-auto">
          <div className="card metric-card">
            <div className="metric-label">{copy.workers}</div>
            <div className="kpi">{stats.workers}</div>
            <div className="metric-subtle">Team accounts</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{copy.jobs}</div>
            <div className="kpi">{stats.jobs}</div>
            <div className="metric-subtle">Jobs in system</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{copy.projects}</div>
            <div className="kpi">{stats.projects}</div>
            <div className="metric-subtle">Projects tracked</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{copy.invoices}</div>
            <div className="kpi">{stats.invoicesOpen}</div>
            <div className="metric-subtle">Not paid yet</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{copy.paymentRequests}</div>
            <div className="kpi">{stats.paymentRequests}</div>
            <div className="metric-subtle">Pending review</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">{copy.subcontractorIssues}</div>
            <div className="kpi">{stats.subcontractorIssues}</div>
            <div className="metric-subtle">Missing W9 / insurance</div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">{copy.quickActions}</h2>

            <div className="link-list">
              <Link href="/workers" className="link-tile">
                <span>{copy.manageWorkers}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/jobs" className="link-tile">
                <span>{copy.manageJobs}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/projects" className="link-tile">
                <span>{copy.openProjects}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/invoices" className="link-tile">
                <span>{copy.reviewInvoices}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/payment-requests" className="link-tile">
                <span>{copy.paymentApprovals}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/subcontractors" className="link-tile">
                <span>{copy.subcontractorCompliance}</span>
                <span className="muted">{copy.open}</span>
              </Link>
            </div>
          </div>

          <div className="card stack">
            <h2 className="section-title">{copy.recentSetup}</h2>

            <div className="info-block">
              <strong>{copy.companySetup}</strong>
              <p>{copy.companySetupText}</p>
            </div>

            <div className="link-list">
              <Link href="/admin" className="link-tile">
                <span>{copy.adminCenter}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/payroll" className="link-tile">
                <span>{copy.payrollArea}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/reports" className="link-tile">
                <span>{copy.reportsArea}</span>
                <span className="muted">{copy.open}</span>
              </Link>

              <Link href="/worker" className="link-tile">
                <span>{copy.workerArea}</span>
                <span className="muted">{copy.open}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}