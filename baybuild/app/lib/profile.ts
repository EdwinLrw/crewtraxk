import { supabase } from "@/app/lib/supabase";

export type AppRole = "owner" | "admin" | "supervisor" | "worker";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  company_name: string | null;
};

export async function ensureProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) return existing as Profile;

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? null,
    role: "worker",
    company_name: "Crew Traxk",
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data as Profile;
}

export async function getMyProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
}