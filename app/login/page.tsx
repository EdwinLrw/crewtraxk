"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile, getMyProfile } from "@/app/lib/profile";
import { useLanguage } from "@/app/lib/useLanguage";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const hasRedirected = useRef(false);

  useEffect(() => {
    const handleUser = async () => {
      if (hasRedirected.current) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const profile = await ensureProfile();
      if (!profile) return;

      hasRedirected.current = true;

      if (["owner", "admin", "supervisor"].includes(profile.role)) {
        router.push("/dashboard");
      } else {
        router.push("/worker");
      }
    };

    handleUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session || hasRedirected.current) return;

      const profile = await getMyProfile();
      if (!profile) return;

      hasRedirected.current = true;

      if (["owner", "admin", "supervisor"].includes(profile.role)) {
        router.push("/dashboard");
      } else {
        router.push("/worker");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function loginWithEmail() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    setLoadingEmail(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://crewtraxk.com";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(t.checkEmailForLogin);
    }

    setLoadingEmail(false);
  }

  async function loginWithGoogle() {
    setMessage("");
    setLoadingGoogle(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://crewtraxk.com";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoadingGoogle(false);
    }
  }

  function handleAppleClick() {
    setMessage("Apple login UI is ready. We can connect it next.");
  }

  function handlePhoneClick() {
    setMessage("Phone login UI is ready. We can connect SMS code login next.");
  }

  function handleTrialClick() {
    setMessage("Trial / paid signup UI is ready. We can connect plans and checkout next.");
  }

  return (
    <div className="auth-shell">
      <main className="auth-center">
        <div className="auth-card-pro">
          <div className="auth-grid">
            <section className="auth-brand-panel">
              <div className="auth-badge">CrewTraxk</div>

              <h1 className="auth-title-pro">Run your crew with confidence</h1>

              <p className="auth-subtitle-pro">
                Login for daily reports, worker tools, job tracking, payroll-ready time
                entries, invoices, and inspections.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <span>Fast worker access from phone or email</span>
                </div>
                <div className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <span>Admin dashboards for jobs, reports, and crew management</span>
                </div>
                <div className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <span>Built for field teams, office teams, and subcontractors</span>
                </div>
              </div>
            </section>

            <section className="auth-form-panel">
              <div className="auth-top">
                <h2 className="auth-form-title">{t.login}</h2>
                <p className="auth-form-subtitle">
                  Choose the sign-in method that works best for you.
                </p>
              </div>

              <div className="auth-form-stack">
                <label className="auth-label">{t.email}</label>

                <input
                  className="auth-input-pro"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="btn-primary-pro"
                  onClick={loginWithEmail}
                  disabled={loadingEmail || loadingGoogle}
                >
                  {loadingEmail ? "Sending login link..." : t.sendLoginLink}
                </button>

                <div className="auth-divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                <div className="auth-alt-grid">
                  <button
                    className="btn-social-pro"
                    onClick={loginWithGoogle}
                    disabled={loadingEmail || loadingGoogle}
                  >
                    <svg
                      className="auth-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.231 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.851 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 13 24 13c3.059 0 5.851 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.277 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.176 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.153 35.091 26.715 36 24 36c-5.21 0-9.619-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 01-4.084 5.565l.003-.002 6.19 5.238C36.972 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                      />
                    </svg>
                    <span>{loadingGoogle ? "Opening Google..." : "Google"}</span>
                  </button>

                  <button className="btn-social-pro btn-dark-pro" onClick={handleAppleClick}>
                    <svg
                      className="auth-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.365 1.43c0 1.14-.466 2.23-1.212 3.028-.84.902-2.212 1.596-3.417 1.5-.15-1.08.39-2.238 1.11-3 .78-.84 2.13-1.44 3.519-1.528zm4.26 16.146c-.54 1.236-.81 1.788-1.5 2.844-.96 1.47-2.31 3.312-3.984 3.324-1.488.012-1.872-.96-3.888-.948-2.016.012-2.436.966-3.924.954-1.674-.012-2.952-1.68-3.912-3.15-2.688-4.122-2.976-8.952-1.314-11.508 1.182-1.824 3.048-2.892 4.8-2.892 1.782 0 2.904.972 4.374.972 1.428 0 2.298-.972 4.362-.972 1.56 0 3.21.846 4.392 2.31-3.858 2.118-3.234 7.632.594 9.066z" />
                    </svg>
                    <span>Apple</span>
                  </button>

                  <button className="btn-social-pro" onClick={handlePhoneClick}>
                    <svg
                      className="auth-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M10 18h4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Phone</span>
                  </button>
                </div>

                <div className="auth-message-wrap">
                  {message ? <p className="auth-message-pro">{message}</p> : null}
                </div>

                <div className="auth-trial-box">
                  <div className="auth-trial-copy">
                    <h3>New company?</h3>
                    <p>
                      Start with a trial and set up your crew, jobs, and admin access.
                    </p>
                  </div>

                  <button className="btn-secondary-pro" onClick={handleTrialClick}>
                    Start free trial
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}