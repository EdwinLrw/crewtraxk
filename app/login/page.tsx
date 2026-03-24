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

  const tx = t as Record<string, string | undefined>;

  const copy = {
    badge: tx.appName || "CrewTraxk",
    heroTitle: tx.loginHeroTitle || "Run your crew with confidence",
    heroSubtitle:
      tx.loginHeroSubtitle ||
      "Login for daily reports, worker tools, job tracking, payroll-ready time entries, invoices, and inspections.",
    feature1:
      tx.loginFeature1 || "Fast access with Google or secure email login links",
    feature2:
      tx.loginFeature2 ||
      "Admin dashboards for jobs, reports, and crew management",
    feature3:
      tx.loginFeature3 ||
      "Built for field teams, office teams, and subcontractors",
    formTitle: tx.login || "Login",
    formSubtitle:
      tx.loginFormSubtitle ||
      "Sign in with Google or get a secure login link by email.",
    email: tx.email || "Email",
    emailPlaceholder: tx.emailPlaceholder || "name@company.com",
    sendLoginLink: tx.sendLoginLink || "Send login link",
    sendingLoginLink: tx.sendingLoginLink || "Sending login link...",
    orContinueWith: tx.orContinueWith || "OR CONTINUE WITH",
    google: tx.google || "Google",
    openingGoogle: tx.openingGoogle || "Opening Google...",
    newCompany: tx.newCompany || "New company?",
    newCompanyText:
      tx.newCompanyText ||
      "Start with a trial and set up your crew, jobs, and admin access.",
    startFreeTrial: tx.startFreeTrial || "Start free trial",
    enterEmail: tx.enterEmail || "Please enter your email.",
    checkEmailForLogin:
      tx.checkEmailForLogin || "Check your email for your login link.",
  };

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

      let profile = await getMyProfile();

      if (!profile) {
        profile = await ensureProfile();
      }

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
      setMessage(copy.enterEmail);
      return;
    }

    setLoadingEmail(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://crewtraxk.com";

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(copy.checkEmailForLogin);
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

  function handleTrialClick() {
    router.push("/pricing");
  }

  return (
    <div className="auth-shell">
      <main className="auth-center">
        <div className="auth-card-pro">
          <div className="auth-grid">
            <section className="auth-brand-panel">
              <div className="auth-badge">{copy.badge}</div>

              <h1 className="auth-title-pro">{copy.heroTitle}</h1>

              <p className="auth-subtitle-pro">{copy.heroSubtitle}</p>

              <div className="auth-feature-list">
                <div className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <span>{copy.feature1}</span>
                </div>
                <div className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <span>{copy.feature2}</span>
                </div>
                <div className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <span>{copy.feature3}</span>
                </div>
              </div>
            </section>

            <section className="auth-form-panel">
              <div className="auth-top">
                <h2 className="auth-form-title">{copy.formTitle}</h2>
                <p className="auth-form-subtitle">{copy.formSubtitle}</p>
              </div>

              <div className="auth-form-stack">
                <label className="auth-label">{copy.email}</label>

                <input
                  className="auth-input-pro"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={copy.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="btn-primary-pro"
                  onClick={loginWithEmail}
                  disabled={loadingEmail || loadingGoogle}
                >
                  {loadingEmail ? copy.sendingLoginLink : copy.sendLoginLink}
                </button>

                <div className="auth-divider">
                  <span>{copy.orContinueWith}</span>
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
                    <span>{loadingGoogle ? copy.openingGoogle : copy.google}</span>
                  </button>
                </div>

                <div className="auth-message-wrap">
                  {message ? <p className="auth-message-pro">{message}</p> : null}
                </div>

                <div className="auth-trial-box">
                  <div className="auth-trial-copy">
                    <h3>{copy.newCompany}</h3>
                    <p>{copy.newCompanyText}</p>
                  </div>

                  <button className="btn-secondary-pro" onClick={handleTrialClick}>
                    {copy.startFreeTrial}
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