import { supabase } from "./supabase";

/* ---------------- PROJECTS ---------------- */

export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function addProject(payload: {
  name: string;
  address: string;
  client: string;
  start_date: string;
  status: string;
  contract_value: number;
  budget_total: number;
  approved_change_orders: number;
}) {
  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectFinancials(
  id: string,
  payload: {
    contract_value?: number;
    budget_total?: number;
    approved_change_orders?: number;
    labor_spent_override?: number;
    subcontractor_spent?: number;
    misc_spent?: number;
    status?: string;
  }
) {
  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectPayments(projectId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getProjectMaterials(projectId: string) {
  const { data, error } = await supabase
    .from("material_purchases")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getProjectTimeEntries(projectId: string) {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("job_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function addProjectPayment(payload: {
  project_id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addMaterialPurchase(payload: {
  project_id: string;
  item_name: string;
  vendor: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchased_on: string;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("material_purchases")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFinancialDashboardMetrics() {
  const [projectsRes, paymentsRes, materialsRes, timeEntriesRes] =
    await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("material_purchases").select("*"),
      supabase.from("time_entries").select("labor_cost"),
    ]);

  if (projectsRes.error) throw projectsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (materialsRes.error) throw materialsRes.error;
  if (timeEntriesRes.error) throw timeEntriesRes.error;

  const projects = (projectsRes.data ?? []) as any[];
  const payments = (paymentsRes.data ?? []) as any[];
  const materials = (materialsRes.data ?? []) as any[];
  const timeEntries = (timeEntriesRes.data ?? []) as any[];

  const activeProjects = projects.filter(
    (p: any) => (p.status ?? "Active") !== "Completed"
  ).length;

  const totalContractValue = projects.reduce(
    (sum: number, p: any) =>
      sum +
      Number(p.contract_value || 0) +
      Number(p.approved_change_orders || 0),
    0
  );

  const paymentsReceived = payments.reduce(
    (sum: number, p: any) => sum + Number(p.amount || 0),
    0
  );

  const materialSpend = materials.reduce(
    (sum: number, m: any) => sum + Number(m.total_cost || 0),
    0
  );

  const laborSpend = timeEntries.reduce(
    (sum: number, t: any) => sum + Number(t.labor_cost || 0),
    0
  );

  const subcontractorSpend = projects.reduce(
    (sum: number, p: any) => sum + Number(p.subcontractor_spent || 0),
    0
  );

  const miscSpend = projects.reduce(
    (sum: number, p: any) => sum + Number(p.misc_spent || 0),
    0
  );

  const totalSpent =
    materialSpend + laborSpend + subcontractorSpend + miscSpend;

  const remainingToCollect = totalContractValue - paymentsReceived;
  const projectedProfit = totalContractValue - totalSpent;
  const grossMargin =
    totalContractValue > 0 ? (projectedProfit / totalContractValue) * 100 : 0;

  return {
    activeProjects,
    totalContractValue,
    paymentsReceived,
    remainingToCollect,
    materialSpend,
    laborSpend,
    subcontractorSpend,
    miscSpend,
    totalSpent,
    projectedProfit,
    grossMargin,
  };
}

export async function getProjectFinancialRows() {
  const [projectsRes, paymentsRes, materialsRes, timeEntriesRes] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("*"),
      supabase.from("material_purchases").select("*"),
      supabase.from("time_entries").select("*"),
    ]);

  if (projectsRes.error) throw projectsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (materialsRes.error) throw materialsRes.error;
  if (timeEntriesRes.error) throw timeEntriesRes.error;

  const projects = (projectsRes.data ?? []) as any[];
  const payments = (paymentsRes.data ?? []) as any[];
  const materials = (materialsRes.data ?? []) as any[];
  const timeEntries = (timeEntriesRes.data ?? []) as any[];

  return projects.map((project: any) => {
    const projectPayments = payments.filter(
      (p: any) => p.project_id === project.id
    );
    const projectMaterials = materials.filter(
      (m: any) => m.project_id === project.id
    );
    const projectTime = timeEntries.filter(
      (t: any) => t.job_id === project.id
    );

    const projectValue =
      Number(project.contract_value || 0) +
      Number(project.approved_change_orders || 0);

    const paymentsReceived = projectPayments.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    );

    const materialsSpent = projectMaterials.reduce(
      (sum: number, m: any) => sum + Number(m.total_cost || 0),
      0
    );

    const laborSpent = projectTime.reduce(
      (sum: number, t: any) => sum + Number(t.labor_cost || 0),
      0
    );

    const subcontractorSpent = Number(project.subcontractor_spent || 0);
    const miscSpent = Number(project.misc_spent || 0);

    const totalSpent =
      materialsSpent + laborSpent + subcontractorSpent + miscSpent;

    const remainingToCollect = projectValue - paymentsReceived;
    const remainingBudget = Number(project.budget_total || 0) - totalSpent;
    const projectedProfit = projectValue - totalSpent;
    const grossMargin =
      projectValue > 0 ? (projectedProfit / projectValue) * 100 : 0;

    return {
      ...project,
      projectValue,
      paymentsReceived,
      materialsSpent,
      laborSpent,
      subcontractorSpent,
      miscSpent,
      totalSpent,
      remainingToCollect,
      remainingBudget,
      projectedProfit,
      grossMargin,
    };
  });
}

/* ---------------- LIVE / PAYROLL ---------------- */

export async function getLiveClockedInWorkers() {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .is("clock_out", null)
    .order("clock_in", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getPayrollSummary() {
  const { data, error } = await supabase
    .from("time_entries")
    .select("worker_name, hours_worked, labor_cost, clock_in")
    .not("clock_out", "is", null);

  if (error) throw error;

  const grouped: Record<
    string,
    { hours: number; labor: number; shifts: number }
  > = {};

  for (const row of ((data ?? []) as any[])) {
    const key = row.worker_name || "Unknown";

    if (!grouped[key]) {
      grouped[key] = { hours: 0, labor: 0, shifts: 0 };
    }

    grouped[key].hours += Number(row.hours_worked || 0);
    grouped[key].labor += Number(row.labor_cost || 0);
    grouped[key].shifts += 1;
  }

  return Object.entries(grouped).map(
    ([workerName, val]: [
      string,
      { hours: number; labor: number; shifts: number }
    ]) => ({
      workerName,
      totalHours: val.hours,
      totalLabor: val.labor,
      shifts: val.shifts,
    })
  );
}

export async function getWorkers() {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

/* ---------------- WORKER ASSIGNMENTS ---------------- */

export async function assignWorkerToProject(payload: {
  project_id: string;
  worker_id: string;
}) {
  const { data, error } = await supabase
    .from("project_assignments")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectAssignments(projectId: string) {
  const { data, error } = await supabase
    .from("project_assignments")
    .select("id, workers(id, name, role)")
    .eq("project_id", projectId);

  if (error) throw error;
  return (data ?? []) as any[];
}

/* ---------------- SUBCONTRACTORS ---------------- */

function makePortalToken() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

export async function getSubcontractors() {
  const { data, error } = await supabase
    .from("subcontractors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function addSubcontractor(payload: {
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  trade: string;
  day_rate: number | null;
  notes: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("subcontractors")
    .insert({
      ...payload,
      contractor_id: user.id,
      portal_token: makePortalToken(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignSubcontractorToProject(payload: {
  project_id: string;
  subcontractor_id: string;
  scope_of_work: string;
  contract_amount: number;
}) {
  const { data, error } = await supabase
    .from("subcontractor_assignments")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSubcontractorAssignments(projectId: string) {
  const { data, error } = await supabase
    .from("subcontractor_assignments")
    .select(
      "id, scope_of_work, contract_amount, subcontractors(id, company_name, contact_name, trade)"
    )
    .eq("project_id", projectId);

  if (error) throw error;
  return (data ?? []) as any[];
}

/* ---------------- SUB PORTAL ---------------- */

export async function getSubcontractorByToken(token: string) {
  const { data, error } = await supabase
    .from("subcontractors")
    .select("*")
    .eq("portal_token", token)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAssignmentsForSubcontractor(subcontractorId: string) {
  const { data, error } = await supabase
    .from("subcontractor_assignments")
    .select(
      "id, scope_of_work, contract_amount, project_id, projects(id, name, address, client, status)"
    )
    .eq("subcontractor_id", subcontractorId);

  if (error) throw error;
  return (data ?? []) as any[];
}

/* ---------------- SUB PAYMENT REQUESTS ---------------- */

export async function addSubcontractorPaymentRequest(payload: {
  subcontractor_id: string;
  project_id: string;
  amount: number;
  request_date: string;
  status: string;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("subcontractor_payment_requests")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPaymentRequestsForSubcontractor(
  subcontractorId: string
) {
  const { data, error } = await supabase
    .from("subcontractor_payment_requests")
    .select("*")
    .eq("subcontractor_id", subcontractorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

/* ---------------- SCHEDULE ---------------- */

export async function getScheduleEvents() {
  const { data, error } = await supabase
    .from("schedule_events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function addScheduleEvent(payload: {
  project_id: string | null;
  assigned_worker_id: string | null;
  assigned_subcontractor_id: string | null;
  title: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("schedule_events")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}