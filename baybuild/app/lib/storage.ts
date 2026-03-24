"use client";

export type Job = {
  id: string
  name: string
  address?: string
  client?: string
  startDate?: string
  status?: string
}

export type Worker = {
  id: string
  name: string
  role?: string
  phone?: string
}

export type TimeEntry = {
  id: string
  workerName: string
  jobId: string
  jobName: string
  clockIn: string
  clockOut: string | null
  hoursWorked: number | null
}

export type Report = {
  id: string
  jobId: string
  jobName: string
  date: string
  workerName: string
  workersOnSite: string
  hoursWorked: string
  materialsUsed: string
  workCompleted: string
  photo?: string
}

export type Invoice = {
  id: string
  jobId: string
  jobName: string
  clientName: string
  invoiceType: string
  amount: string
  dueDate: string
  status: string
  notes: string
}

export type Inspection = {
  id: string
  jobId: string
  jobName: string
  inspectionType: string
  date: string
  status: string
  notes: string
}

function read(key: string, fallback: any) {
  if (typeof window === "undefined") return fallback
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

function write(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const store = {
  getJobs: () => read("jobs", []),
  setJobs: (v: Job[]) => write("jobs", v),

  getWorkers: () => read("workers", []),
  setWorkers: (v: Worker[]) => write("workers", v),

  getReports: () => read("reports", []),
  setReports: (v: Report[]) => write("reports", v),

  getInvoices: () => read("invoices", []),
  setInvoices: (v: Invoice[]) => write("invoices", v),

  getInspections: () => read("inspections", []),
  setInspections: (v: Inspection[]) => write("inspections", v),

  getTimeEntries: () => read("timeEntries", []),
  setTimeEntries: (v: TimeEntry[]) => write("timeEntries", v),
}