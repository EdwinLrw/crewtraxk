"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";
import { getLanguage, messages, Language } from "@/app/lib/i18n";
import { canUseClock, canUseReports } from "@/app/lib/permissions";

export default function WorkerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());

    async function loadWorker() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await ensureProfile();

      if (!profile) {
        router.push("/login");
        return;
      }

      if (["owner", "admin", "supervisor"].includes(profile.role)) {
        router.push("/dashboard");
        return;
      }

      setUserEmail(user.email || "");
      setLoading(false);
    }

    loadWorker();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const t = messages[lang];

  if (loading) {
    return (
      <main className="page">
        <div className="card">{t.loading}</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="title">{t.workerDashboard}</h1>
          <p className="muted">
            {t.loggedInAs} {userEmail}
          </p>
        </div>
        <button className="secondary" onClick={logout}>
          {t.logout}
        </button>
      </div>

      <div className="grid-2">
        {canUseClock("worker") && (
          <Link href="/clock" className="card">
            {t.clockIn}
          </Link>
        )}

        {canUseReports("worker") && (
          <Link href="/reports" className="card">
            {t.submitDailyReport}
          </Link>
        )}
      </div>
    </main>
  );
}