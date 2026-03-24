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

  async function login() {
    setMessage("");
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

  return (
    <div className="auth-shell">
      <main className="auth-center">
        <div className="auth-card-pro">
          <div className="auth-top">
            <div className="auth-badge">CrewTraxk</div>
            <h1 className="auth-title-pro">{t.login}</h1>
            <p className="auth-subtitle-pro">
              Access your crew dashboard, jobs, reports, and worker tools.
            </p>
          </div>

          <div className="auth-form-stack">
            <label className="auth-label">{t.email}</label>

            <input
              className="auth-input-pro"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="btn-primary-pro"
              onClick={login}
              disabled={loadingEmail || loadingGoogle || !email.trim()}
            >
              {loadingEmail ? "Sending..." : t.sendLoginLink}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              className="btn-social-pro"
              onClick={loginWithGoogle}
              disabled={loadingEmail || loadingGoogle}
            >
              <svg
                className="google-icon"
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

              <span>
                {loadingGoogle ? "Opening Google..." : "Continue with Google"}
              </span>
            </button>

            {message ? <p className="auth-message-pro">{message}</p> : null}
          </div>
        </div>
      </main>
    </div>
  );
}