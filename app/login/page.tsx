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
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://crewtraxk.com/auth/callback";

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
  }

  return (
    <div className="page-shell">
      <main className="center-screen">
        <div className="card auth-card stack">
          <div className="badge">CrewTraxk Login</div>

          <h1 className="title" style={{ fontSize: 32 }}>
            {t.login}
          </h1>

          <p className="subtitle">{t.subtitle}</p>

          <input
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={login}>{t.sendLoginLink}</button>

          <p className="muted">{message}</p>
        </div>
      </main>
    </div>
  );
}