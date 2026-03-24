import { supabase } from "@/app/lib/supabase";

export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addJob(payload: {
  name: string;
  address: string;
  client: string;
  start_date: string;
  status: string;
}) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}

export async function getWorkers() {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getWorkerByName(name: string) {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addWorker(payload: {
  name: string;
  role: string;
  phone: string;
  pay_type: string;
  hourly_rate: number;
  annual_salary: number;
  day_rate: number;
}) {
  const { data, error } = await supabase
    .from("workers")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorker(id: string, payload: {
  name?: string;
  role?: string;
  phone?: string;
  pay_type?: string;
  hourly_rate?: number;
  annual_salary?: number;
  day_rate?: number;
}) {
  const { data, error } = await supabase
    .from("workers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorker(id: string) {
  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) throw error;
}

export async function getTimeEntries() {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addTimeEntry(payload: {
  worker_name: string;
  job_id: string;
  job_name: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  labor_cost: number | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const { data, error } = await supabase
    .from("time_entries")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTimeEntry(
  id: string,
  payload: {
    clock_out: string;
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

export async function getReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addReport(payload: {
  job_id: string;
  job_name: string;
  worker_name: string;
  date: string;
  workers_on_site: string;
  hours_worked: string;
  materials_used: string;
  work_completed: string;
  photo?: string;
}) {
  const { data, error } = await supabase
    .from("reports")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addInvoice(payload: {
  job_id: string;
  job_name: string;
  client_name: string;
  invoice_type: string;
  amount: string;
  due_date: string;
  status: string;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("invoices")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInspections() {
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addInspection(payload: {
  job_id: string;
  job_name: string;
  inspection_type: string;
  date: string;
  status: string;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("inspections")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDashboardCounts() {
  const [jobsRes, workersRes, reportsRes, invoicesRes, inspectionsRes, timeEntriesRes] =
    await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("workers").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }),
      supabase.from("invoices").select("*", { count: "exact", head: true }),
      supabase.from("inspections").select("*", { count: "exact", head: true }),
      supabase.from("time_entries").select("clock_out"),
    ]);

  return {
    jobs: jobsRes.count ?? 0,
    workers: workersRes.count ?? 0,
    reports: reportsRes.count ?? 0,
    invoices: invoicesRes.count ?? 0,
    inspections: inspectionsRes.count ?? 0,
    openClock:
      timeEntriesRes.data?.filter((entry) => entry.clock_out === null).length ?? 0,
  };
}

export function calculateLaborCost(
  payType: string,
  hoursWorked: number,
  hourlyRate: number,
  annualSalary: number,
  dayRate: number
) {
  if (payType === "hourly") {
    return hoursWorked * hourlyRate;
  }

  if (payType === "salary") {
    const estimatedHourly = annualSalary / 52 / 40;
    return hoursWorked * estimatedHourly;
  }

  if (payType === "day_rate") {
    return hoursWorked > 0 ? dayRate : 0;
  }

  return 0;
}