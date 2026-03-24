export default function PricingCancelPage() {
  return (
    <div className="auth-shell">
      <main className="auth-center">
        <div className="auth-card-pro" style={{ maxWidth: 760 }}>
          <div className="auth-top">
            <h1 className="auth-form-title">Checkout canceled</h1>
            <p className="auth-form-subtitle">
              No worries — your subscription was not started.
            </p>
          </div>

          <div className="auth-trial-box" style={{ marginTop: 20 }}>
            <div className="auth-trial-copy">
              <h3>Want to try again?</h3>
              <p>
                Go back to pricing and choose the plan that fits your crew best.
              </p>
            </div>

            <a className="btn-primary-pro" href="/pricing">
              Back to pricing
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}