"use client";

import Link from "next/link";
import { useLanguage } from "@/app/lib/useLanguage";

const featureCards = [
  {
    title: "Project tracking",
    text: "Track jobs, status, schedules, and financial performance in one cleaner dashboard.",
  },
  {
    title: "Worker and crew management",
    text: "Keep your team organized with worker views, clock activity, payroll support, and time admin tools.",
  },
  {
    title: "Subcontractor portal",
    text: "Give subcontractors their own portal to upload documents and request payment without chasing them down.",
  },
  {
    title: "Compliance controls",
    text: "Choose whether W9s and insurance are required, track expiration dates, and block payments when needed.",
  },
  {
    title: "Financial visibility",
    text: "See collected payments, spending, remaining balances, and projected profit across projects.",
  },
  {
    title: "Operations in one system",
    text: "Bring together projects, subs, reports, inspections, invoices, schedules, and admin tools.",
  },
];

const comparisons = [
  {
    brand: "Procore",
    text: "Powerful, but often heavier and more enterprise-style than smaller contractors need.",
  },
  {
    brand: "Buildertrend",
    text: "Strong overall platform, but CrewTraxk is being shaped around a tighter contractor + subcontractor workflow.",
  },
  {
    brand: "Jobber / Housecall-type tools",
    text: "Good for service workflows, but not as focused on subcontractor compliance and payment control.",
  },
  {
    brand: "CrewTraxk",
    text: "Built to feel simpler, more direct, and more focused on crews, subs, compliance, and day-to-day operations.",
  },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">{t.appName}</div>

          <nav className="nav">
            <a className="nav-link" href="#overview">
              Overview
            </a>
            <a className="nav-link" href="#features">
              Features
            </a>
            <a className="nav-link" href="#about">
              About
            </a>
            <a className="nav-link" href="#pricing">
              Pricing
            </a>
          </nav>

          <div className="row">
            <Link href="/login">
              <button className="secondary-button">Login</button>
            </Link>
            <Link href="/dashboard">
              <button>{t.dashboard}</button>
            </Link>
          </div>
        </div>
      </header>

      <main className="page stack">
        <section id="overview" className="card hero-panel">
          <div className="hero-panel-content">
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div className="stack" style={{ gap: 16 }}>
                <div className="badge">Built for contractors</div>

                <h1 className="title">
                  {t.appName}
                  <br />
                  Built to run jobs,
                  <br />
                  crews, and subs better.
                </h1>

                <p className="hero-blurb">
                  {t.subtitle} CrewTraxk is designed to help contractors run a
                  more professional, more organized operation without relying on
                  scattered paperwork, calls, and messy follow-up.
                </p>

                <div className="row" style={{ flexWrap: "wrap" }}>
                  <Link href="/login">
                    <button>Get Started</button>
                  </Link>
                  <a href="#pricing">
                    <button className="secondary-button">
                      View Subscription
                    </button>
                  </a>
                </div>
              </div>

              <div className="card">
                <div className="section-title">What CrewTraxk helps with</div>

                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-item-title">Project tracking</div>
                    <div className="muted">
                      Stay on top of jobs, schedules, budgets, and progress.
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-item-title">
                      Subcontractor management
                    </div>
                    <div className="muted">
                      Organize subcontractors, compliance, and payment requests
                      in one place.
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-item-title">
                      Cleaner operations
                    </div>
                    <div className="muted">
                      Replace messy workflows with one system built for real
                      contractor use.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="stack">
          <div>
            <h2 className="title" style={{ fontSize: 32 }}>
              Features
            </h2>
            <p className="subtitle">
              More than a simple dashboard. CrewTraxk is being built as an
              operating system for contractor workflows.
            </p>
          </div>

          <div className="grid-3">
            {featureCards.map((feature) => (
              <div key={feature.title} className="card">
                <div className="section-title">{feature.title}</div>
                <div className="muted">{feature.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="grid-2">
          <div className="card">
            <div className="section-title">About Me</div>
            <div className="muted">
              I’m building CrewTraxk to create a cleaner and more useful system
              for contractors who want tighter control over jobs, workers,
              subcontractors, compliance, and project money.
              <br />
              <br />
              The goal is not just to make software that looks good. The goal is
              to build something contractors can actually use to save time,
              reduce missed paperwork, improve organization, and run the
              business in a more professional way.
              <br />
              <br />
              CrewTraxk is meant to grow into a serious contractor platform with
              job tracking, crew management, subcontractor portals, compliance
              controls, reporting, and better operational visibility.
            </div>
          </div>

          <div className="card">
            <div className="section-title">Why CrewTraxk</div>
            <div className="muted">
              A lot of tools are either too generic, too bloated, or not focused
              enough on the way contractor businesses actually run.
              <br />
              <br />
              CrewTraxk is being shaped to feel simpler, more direct, and more
              useful for contractors who need something practical for day-to-day
              operations.
            </div>
          </div>
        </section>

        <section id="pricing" className="grid-2">
          <div className="card pricing-card">
            <div className="section-title">Subscription</div>

            <div className="price">
              $99
              <span
                style={{
                  fontSize: 16,
                  color: "#94a3b8",
                  fontWeight: 600,
                  marginLeft: 6,
                }}
              >
                / month
              </span>
            </div>

            <p className="subtitle" style={{ marginTop: 14 }}>
              One cleaner system for project tracking, subcontractors, document
              compliance, payment requests, and contractor operations.
            </p>

            <div className="feature-list" style={{ marginTop: 18 }}>
              <div className="feature-item">
                <div className="feature-item-title">What you get</div>
                <div className="muted">
                  Dashboard, projects, crews, subcontractor portals, compliance,
                  and operational visibility in one place.
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-item-title">Why the price works</div>
                <div className="muted">
                  Built to feel more affordable and more focused for smaller and
                  growing contractor companies.
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 20, flexWrap: "wrap" }}>
              <Link href="/login">
                <button>Start Now</button>
              </Link>
              <Link href="/dashboard">
                <button className="secondary-button">{t.dashboard}</button>
              </Link>
            </div>
          </div>

          <div className="card pricing-card">
            <div className="section-title">How it compares</div>

            <div className="feature-list">
              {comparisons.map((item) => (
                <div key={item.brand} className="feature-item">
                  <div className="feature-item-title">{item.brand}</div>
                  <div className="muted">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}