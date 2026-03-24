"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/lib/useLanguage";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";
import { canViewWorkers } from "@/app/lib/permissions";
import { addWorker, deleteWorker, getWorkers, updateWorker } from "@/app/lib/db";

type WorkerRow = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  pay_type: string | null;
  hourly_rate: number | null;
  annual_salary: number | null;
  day_rate: number | null;
};

export default function WorkersPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    payType: "hourly",
    hourlyRate: "",
    annualSalary: "",
    dayRate: "",
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

      if (!profile || !canViewWorkers(profile.role)) {
        router.push("/worker");
        return;
      }

      const data = await getWorkers();
      setWorkers(data);
      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddWorker() {
    if (!form.name.trim()) return;

    const created = await addWorker({
      name: form.name,
      role: form.role,
      phone: form.phone,
      pay_type: form.payType,
      hourly_rate: Number(form.hourlyRate || 0),
      annual_salary: Number(form.annualSalary || 0),
      day_rate: Number(form.dayRate || 0),
    });

    setWorkers((prev) => [created, ...prev]);
    setForm({
      name: "",
      role: "",
      phone: "",
      payType: "hourly",
      hourlyRate: "",
      annualSalary: "",
      dayRate: "",
    });
  }

  async function handleDeleteWorker(id: string) {
    await deleteWorker(id);
    setWorkers((prev) => prev.filter((worker) => worker.id !== id));
  }

  async function handleSaveWorker(worker: WorkerRow) {
    const updated = await updateWorker(worker.id, {
      name: worker.name || "",
      role: worker.role || "",
      phone: worker.phone || "",
      pay_type: worker.pay_type || "hourly",
      hourly_rate: Number(worker.hourly_rate || 0),
      annual_salary: Number(worker.annual_salary || 0),
      day_rate: Number(worker.day_rate || 0),
    });

    setWorkers((prev) =>
      prev.map((w) => (w.id === worker.id ? updated : w))
    );
    setEditingId(null);
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
      <h1 className="title">{t.workers}</h1>

      <div className="card stack">
        <div className="grid-2">
          <input
            placeholder={t.workerName}
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            placeholder={t.role}
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, role: e.target.value }))
            }
          />
          <input
            placeholder={t.phone}
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          <select
            value={form.payType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, payType: e.target.value }))
            }
          >
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
            <option value="day_rate">Day Rate</option>
          </select>

          <input
            placeholder="Hourly Rate"
            value={form.hourlyRate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hourlyRate: e.target.value }))
            }
          />

          <input
            placeholder="Annual Salary"
            value={form.annualSalary}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, annualSalary: e.target.value }))
            }
          />

          <input
            placeholder="Day Rate"
            value={form.dayRate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, dayRate: e.target.value }))
            }
          />
        </div>

        <div>
          <button onClick={handleAddWorker}>{t.addWorker}</button>
        </div>
      </div>

      <div className="list">
        {workers.map((worker) => (
          <div key={worker.id} className="card stack">
            {editingId === worker.id ? (
              <>
                <input
                  value={worker.name || ""}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id ? { ...w, name: e.target.value } : w
                      )
                    )
                  }
                />
                <input
                  value={worker.role || ""}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id ? { ...w, role: e.target.value } : w
                      )
                    )
                  }
                />
                <input
                  value={worker.phone || ""}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id ? { ...w, phone: e.target.value } : w
                      )
                    )
                  }
                />
                <select
                  value={worker.pay_type || "hourly"}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id ? { ...w, pay_type: e.target.value } : w
                      )
                    )
                  }
                >
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                  <option value="day_rate">Day Rate</option>
                </select>
                <input
                  placeholder="Hourly Rate"
                  value={String(worker.hourly_rate || 0)}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id
                          ? { ...w, hourly_rate: Number(e.target.value || 0) }
                          : w
                      )
                    )
                  }
                />
                <input
                  placeholder="Annual Salary"
                  value={String(worker.annual_salary || 0)}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id
                          ? { ...w, annual_salary: Number(e.target.value || 0) }
                          : w
                      )
                    )
                  }
                />
                <input
                  placeholder="Day Rate"
                  value={String(worker.day_rate || 0)}
                  onChange={(e) =>
                    setWorkers((prev) =>
                      prev.map((w) =>
                        w.id === worker.id
                          ? { ...w, day_rate: Number(e.target.value || 0) }
                          : w
                      )
                    )
                  }
                />
                <div className="row">
                  <button onClick={() => handleSaveWorker(worker)}>Save</button>
                  <button className="secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <strong>{worker.name}</strong>
                    <div className="muted">
                      {worker.role || t.noRole} · {worker.phone || t.noPhone}
                    </div>
                  </div>
                  <div className="badge">{worker.pay_type || "hourly"}</div>
                </div>

                <div>Hourly: ${Number(worker.hourly_rate || 0)}</div>
                <div>Salary: ${Number(worker.annual_salary || 0)}</div>
                <div>Day Rate: ${Number(worker.day_rate || 0)}</div>

                <div className="row">
                  <button onClick={() => setEditingId(worker.id)}>Edit Pay</button>
                  <button className="danger" onClick={() => handleDeleteWorker(worker.id)}>
                    {t.delete}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}