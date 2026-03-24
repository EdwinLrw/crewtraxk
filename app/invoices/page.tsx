"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/lib/useLanguage";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";
import { canViewInvoices } from "@/app/lib/permissions";
import { addInvoice, getInvoices, getJobs, updateInvoiceStatus } from "@/app/lib/db";

type JobRow = {
  id: string;
  name: string;
  client: string | null;
};

type InvoiceRow = {
  id: string;
  job_id: string;
  job_name: string;
  client_name: string | null;
  invoice_type: string | null;
  amount: string | null;
  due_date: string | null;
  status: string | null;
  notes: string | null;
};

export default function InvoicesPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    jobId: "",
    clientName: "",
    invoiceType: "Deposit",
    amount: "",
    dueDate: "",
    status: "Pending",
    notes: "",
  });

  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await ensureProfile();

      if (!profile || !canViewInvoices(profile.role)) {
        router.push("/worker");
        return;
      }

      const loadedJobs = await getJobs();
      const loadedInvoices = await getInvoices();

      setJobs(loadedJobs);
      setInvoices(loadedInvoices);

      if (loadedJobs.length > 0) {
        setForm((prev) => ({
          ...prev,
          jobId: loadedJobs[0].id,
          clientName: loadedJobs[0].client || "",
        }));
      }

      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddInvoice() {
    const job = jobs.find((j) => j.id === form.jobId);

    if (!job) {
      alert(t.selectAJob);
      return;
    }

    const created = await addInvoice({
      job_id: job.id,
      job_name: job.name,
      client_name: form.clientName,
      invoice_type: form.invoiceType,
      amount: form.amount,
      due_date: form.dueDate,
      status: form.status,
      notes: form.notes,
    });

    setInvoices((prev) => [created, ...prev]);

    setForm((prev) => ({
      ...prev,
      amount: "",
      dueDate: "",
      notes: "",
    }));
  }

  async function handleMarkPaid(id: string) {
    const updated = await updateInvoiceStatus(id, "Paid");
    setInvoices((prev) =>
      prev.map((invoice) => (invoice.id === id ? updated : invoice))
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">{t.loading}</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">{t.invoices}</h1>

      <div className="card stack">
        <div className="grid-2">
          <select
            value={form.jobId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, jobId: e.target.value }))
            }
          >
            <option value="">{t.selectJob}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>

          <input
            placeholder={t.clientName}
            value={form.clientName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, clientName: e.target.value }))
            }
          />

          <select
            value={form.invoiceType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, invoiceType: e.target.value }))
            }
          >
            <option value="Deposit">{t.deposit}</option>
            <option value="Progress">{t.progress}</option>
            <option value="Final">{t.final}</option>
            <option value="Custom">{t.custom}</option>
          </select>

          <input
            placeholder={t.amount}
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amount: e.target.value }))
            }
          />

          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="Pending">{t.pending}</option>
            <option value="Sent">{t.sent}</option>
            <option value="Paid">{t.paid}</option>
          </select>
        </div>

        <textarea
          placeholder={t.notes}
          value={form.notes}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />

        <div>
          <button onClick={handleAddInvoice}>{t.createInvoice}</button>
        </div>
      </div>

      <div className="list">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{invoice.job_name}</strong>
              <span className="badge">{invoice.status}</span>
            </div>

            <div>
              <strong>{t.clientName}:</strong> {invoice.client_name}
            </div>

            <div>
              <strong>{t.type}:</strong> {invoice.invoice_type}
            </div>

            <div>
              <strong>{t.amount}:</strong> ${invoice.amount}
            </div>

            <div>
              <strong>{t.due}:</strong> {invoice.due_date || "-"}
            </div>

            <div>
              <strong>{t.notes}:</strong> {invoice.notes || "-"}
            </div>

            {invoice.status !== "Paid" && (
              <div>
                <button onClick={() => handleMarkPaid(invoice.id)}>
                  {t.markPaid}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}