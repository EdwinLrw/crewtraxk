export type AppRole = "owner" | "admin" | "supervisor" | "worker";

export function canViewDashboard(role: AppRole) {
  return ["owner", "admin", "supervisor"].includes(role);
}

export function canViewAdmin(role: AppRole) {
  return ["owner", "admin"].includes(role);
}

export function canViewWorkers(role: AppRole) {
  return ["owner", "admin", "supervisor"].includes(role);
}

export function canViewJobs(role: AppRole) {
  return ["owner", "admin", "supervisor"].includes(role);
}

export function canViewInvoices(role: AppRole) {
  return ["owner", "admin"].includes(role);
}

export function canViewInspections(role: AppRole) {
  return ["owner", "admin", "supervisor"].includes(role);
}

export function canUseClock(role: AppRole) {
  return ["owner", "admin", "supervisor", "worker"].includes(role);
}

export function canUseReports(role: AppRole) {
  return ["owner", "admin", "supervisor", "worker"].includes(role);
}

export function canViewProjects(role: AppRole) {
  return ["owner", "admin", "supervisor"].includes(role);
}