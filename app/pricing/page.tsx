"use client";

import { useState } from "react";

type PlanKey = "starter" | "pro" | "business";

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState("");

  async function startCheckout(plan: PlanKey) {
    try {
      setError("");
      setLoadingPlan(plan);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      if (!data.url) {
        throw new Error("No checkout URL returned.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="auth-shell">
      <main className="auth-center">
        <div className="auth-card-pro" style={{ maxWidth: 1200 }}>
          <div className="auth-top" style={{ marginBottom: 28 }}>
            <h1 className="auth-form-title">Choose your CrewTraxk plan</h1>
            <p className="auth-form-subtitle">
              Start your membership and get your crew, jobs, reports, payroll-ready time,
              invoices, and inspections organized in one place.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-badge">Starter</div>
              <h2 className="pricing-title">$49/mo</h2>
              <p className="pricing-subtitle">Best for smaller crews getting set up fast.</p>

              <div className="pricing-feature-list">
                <div className="pricing-feature-item">Up to 10 workers</div>
                <div className="pricing-feature-item">Job tracking</div>
                <div className="pricing-feature-item">Daily reports</div>
                <div className="pricing-feature-item">Time tracking</div>
              </div>

              <button
                className="btn-primary-pro"
                onClick={() => startCheckout("starter")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "starter" ? "Opening checkout..." : "Start Starter"}
              </button>
            </div>

            <div className="pricing-card pricing-card-featured">
              <div className="pricing-badge pricing-badge-featured">Most Popular</div>
              <h2 className="pricing-title">$99/mo</h2>
              <p className="pricing-subtitle">Best for growing contractors and office teams.</p>

              <div className="pricing-feature-list">
                <div className="pricing-feature-item">Up to 30 workers</div>
                <div className="pricing-feature-item">Everything in Starter</div>
                <div className="pricing-feature-item">Invoices</div>
                <div className="pricing-feature-item">Inspections</div>
                <div className="pricing-feature-item">Subcontractor tracking</div>
              </div>

              <button
                className="btn-primary-pro"
                onClick={() => startCheckout("pro")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "pro" ? "Opening checkout..." : "Start Pro"}
              </button>
            </div>

            <div className="pricing-card">
              <div className="pricing-badge">Business</div>
              <h2 className="pricing-title">$199/mo</h2>
              <p className="pricing-subtitle">Best for larger operations and more admin control.</p>

              <div className="pricing-feature-list">
                <div className="pricing-feature-item">Up to 100 workers</div>
                <div className="pricing-feature-item">Everything in Pro</div>
                <div className="pricing-feature-item">Priority support</div>
                <div className="pricing-feature-item">More admin access</div>
                <div className="pricing-feature-item">Scale-ready setup</div>
              </div>

              <button
                className="btn-primary-pro"
                onClick={() => startCheckout("business")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "business" ? "Opening checkout..." : "Start Business"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="auth-message-wrap" style={{ marginTop: 20 }}>
              <p className="auth-message-pro">{error}</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}