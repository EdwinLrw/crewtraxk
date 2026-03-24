"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";

type FinancialMetrics = {
  activeProjects: number;
  totalContractValue: number;
  paymentsReceived: number;
  remainingToCollect: number;
  materialSpend: number;
  laborSpend: number;
  subcontractorSpend: number;
  miscSpend: number;
  totalSpent: number;
  projectedProfit: number;
  grossMargin: number;
};

type ProjectRow = {
  id: string;
  name: string;
  client: string | null;
  status: string | null;
  projectValue: number;
  paymentsReceived: number;
  materialsSpent: number;
  laborSpent: number;
  subcontractorSpent: number;
  miscSpent: number;
  totalSpent: number;
  remainingToCollect: number;
  remainingBudget: number;
  projectedProfit: number;
  grossMargin: number;
};

const quickLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/jobs", label: "Jobs" },
  { href: "/workers", label: "Workers" },
  { href: "/clock", label: "Clock In / Out" },
  { href: "/reports", label: "Reports" },
  { href: "/invoices", label: "Invoices" },
  { href: "/inspections", label: "Inspections" },
  { href: "/subcontractors", label: "Subcontractors" },
  { href: "/payroll", label: "Payroll" },
  { href: "/calendar", label: "Calendar" },
];

function money(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function badgeClass(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "completed") return "badge success";
  if (value === "delayed" || value === "behind") return "badge danger";
  return "badge";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    activeProjects: 0,
    totalContractValue: 0,
    paymentsReceived: 0,
    remainingToCollect: 0,
    materialSpend: 0,
    laborSpend: 0,
    subcontractorSpend: 0,
    miscSpend: 0,
    totalSpent: 0,
    projectedProfit: 0,
    grossMargin: 0,
  });
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const profile = await ensureProfile();

      if (!profile || !["owner", "admin", "supervisor"].includes(profile.role)) {
        window.location.href = "/worker";
        return;
      }

      setUserEmail(user.email || "");

      const { getFinancialDashboardMetrics, getProjectFinancialRows } =
        await import("@/app/lib/projects-db");

      const [dashboardMetrics, projectRows] = await Promise.all([
        getFinancialDashboardMetrics(),
        getProjectFinancialRows(),
      ]);

      setMetrics(dashboardMetrics);
      setProjects(projectRows);
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
          <div className="card">Loading dashboard.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}
          >
            <div>
              <div
                className="brand"
                style={{
                  fontSize: "46px",
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  marginBottom: "18px",
                }}
              >
                CrewTraxk
              </div>

              <nav className="nav" style={{ gap: "14px" }}>
                <Link className="nav-link" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="nav-link" href="/jobs">
                  Jobs
                </Link>
                <Link className="nav-link" href="/projects">
                  Projects
                </Link>
                <Link className="nav-link" href="/workers">
                  Workers
                </Link>
                <Link className="nav-link" href="/clock">
                  Clock In / Out
                </Link>
                <Link className="nav-link" href="/reports">
                  Reports
                </Link>
                <Link className="nav-link" href="/invoices">
                  Invoices
                </Link>
                <Link className="nav-link" href="/inspections">
                  Inspections
                </Link>
                <Link className="nav-link" href="/calendar">
                  Calendar
                </Link>
                <Link className="nav-link" href="/time-admin">
                  Time Admin
                </Link>
                <Link className="nav-link" href="/payroll">
                  Payroll
                </Link>
                <Link className="nav-link" href="/live">
                  Live Crew
                </Link>
                <Link className="nav-link" href="/subcontractors">
                  Subcontractors
                </Link>
                <Link className="nav-link" href="/admin">
                  Admin
                </Link>
              </nav>
            </div>

            <div
              className="row"
              style={{
                alignItems: "flex-start",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <button className="secondary-button">EN</button>
              <button className="secondary-button">ES</button>
              <button className="secondary-button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="page stack">
        <section className="hero">
          <div className="hero-copy">
            <h1 className="title">Financial Dashboard</h1>
            <p className="hero-blurb">
              Track project value, spending, collected payments, remaining
              balance, and projected profit in one place.
            </p>
            <div className="muted">Logged in as {userEmail}</div>
          </div>
        </section>

        <section className="grid-auto">
          <div className="card metric-card">
            <div className="metric-label">Active Projects</div>
            <div className="kpi">{metrics.activeProjects}</div>
            <div className="metric-subtle">Currently in progress</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Total Contract Value</div>
            <div className="kpi">{money(metrics.totalContractValue)}</div>
            <div className="metric-subtle">Contracts + approved changes</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Payments Received</div>
            <div className="kpi">{money(metrics.paymentsReceived)}</div>
            <div className="metric-subtle">Collected so far</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Remaining To Collect</div>
            <div className="kpi">{money(metrics.remainingToCollect)}</div>
            <div className="metric-subtle">Outstanding revenue</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Material Spend</div>
            <div className="kpi">{money(metrics.materialSpend)}</div>
            <div className="metric-subtle">Materials purchased</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Labor Spend</div>
            <div className="kpi">{money(metrics.laborSpend)}</div>
            <div className="metric-subtle">Crew labor cost</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Subcontractor Spend</div>
            <div className="kpi">{money(metrics.subcontractorSpend)}</div>
            <div className="metric-subtle">Outside labor and subcontractors</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Misc Spend</div>
            <div className="kpi">{money(metrics.miscSpend)}</div>
            <div className="metric-subtle">Other tracked costs</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Total Spent</div>
            <div className="kpi">{money(metrics.totalSpent)}</div>
            <div className="metric-subtle">All tracked spending</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Projected Profit</div>
            <div className="kpi">{money(metrics.projectedProfit)}</div>
            <div className="metric-subtle">Based on current numbers</div>
          </div>

          <div className="card metric-card">
            <div className="metric-label">Gross Margin</div>
            <div className="kpi">{metrics.grossMargin.toFixed(1)}%</div>
            <div className="metric-subtle">Current project margin</div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <h2 className="section-title">Quick Links</h2>

            <div className="link-list">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href} className="link-tile">
                  <span>{item.label}</span>
                  <span className="muted">Open</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card stack">
            <h2 className="section-title">Why CrewTraxk fits here</h2>

            <div className="muted">
              This is your operations hub. It makes more sense for the product
              description to live here as a short overview beside your quick
              actions, instead of floating near the top where the dashboard
              numbers should stay the focus.
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-item-title">Subcontractor compliance</div>
                <div className="muted">
                  Control W9 and insurance requirements before payment requests
                  go through.
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-item-title">Project visibility</div>
                <div className="muted">
                  Stay on top of spending, remaining collections, and profit.
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-item-title">Operational control</div>
                <div className="muted">
                  Keep jobs, crews, and subcontractors organized as the company
                  grows.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card stack">
          <h2 className="section-title">Project Financial Summary</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                  <th style={{ textAlign: "right" }}>Received</th>
                  <th style={{ textAlign: "right" }}>Spent</th>
                  <th style={{ textAlign: "right" }}>Remaining</th>
                  <th style={{ textAlign: "right" }}>Profit</th>
                  <th style={{ textAlign: "right" }}>Margin</th>
                </tr>
              </thead>

              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="muted">
                      No project data yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <Link href={`/projects/${project.id}`}>
                          <div style={{ fontWeight: 700 }}>{project.name}</div>
                        </Link>
                      </td>
                      <td>{project.client || "-"}</td>
                      <td>
                        <span className={badgeClass(project.status)}>
                          {project.status || "Active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {money(project.projectValue)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {money(project.paymentsReceived)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {money(project.totalSpent)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {money(project.remainingToCollect)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {money(project.projectedProfit)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {project.grossMargin.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}