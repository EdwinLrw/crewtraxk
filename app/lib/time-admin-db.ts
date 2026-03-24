import { supabase } from "@/app/lib/supabase";

export async function getAllTimeEntries() {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .order("clock_in", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateAdminTimeEntry(
  id: string,
  payload: {
    clock_in: string;
    clock_out: string | null;
    hours_worked: number;
    labor_cost: number;
  }
) {
  const { data, error } = await supabase
    .from("time_entries")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addTimeAdjustmentLog(payload: {
  time_entry_id: string;
  adjusted_by: string;
  old_clock_in: string | null;
  new_clock_in: string | null;
  old_clock_out: string | null;
  new_clock_out: string | null;
  old_hours_worked: number | null;
  new_hours_worked: number | null;
  old_labor_cost: number | null;
  new_labor_cost: number | null;
  reason: string;
}) {
  const { data, error } = await supabase
    .from("time_entry_adjustments")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTimeAdjustmentLogs() {
  const { data, error } = await supabase
    .from("time_entry_adjustments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}