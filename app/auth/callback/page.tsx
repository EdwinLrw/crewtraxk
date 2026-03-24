"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function finishLogin() {
      // Let Supabase read tokens from the URL/hash and restore the session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
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
      } else {
        router.push("/worker");
      }
    }

    finishLogin();
  }, [router]);

  return (
    <main className="page">
      <div className="card">Signing you in...</div>
    </main>
  );
}