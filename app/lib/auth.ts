import { supabase } from "@/app/lib/supabase";

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}