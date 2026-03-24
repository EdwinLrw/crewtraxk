"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addProject, getProjects } from "@/app/lib/projects-db";

type ProjectRow = {
  id: string;
  name: string;
  address: string | null;
  client: string | null;
  start_date: string | null;
  status: string | null;
  contract_value: number | null;
  budget_total: number | null;
  approved_change_orders: number | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    client: "",
    startDate: "",
    status: "Active",
    contractValue: "",
    budgetTotal: "",
    approvedChangeOrders: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects();
        setProjects(data as ProjectRow[]);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleAddProject() {
    if (!form.name.trim()) return;

    try {
      const created = await addProject({
        name: form.name.trim(),
        address: form.address.trim(),
        client: form.client.trim(),
        start_date: form.startDate,
        status: form.status,
        contract_value: Number(form.contractValue || 0),
        budget_total: Number(form.budgetTotal || 0),
        approved_change_orders: Number(form.approvedChangeOrders || 0),
      });

      setProjects((prev) => [created as ProjectRow, ...prev]);

      setForm({
        name: "",
        address: "",
        client: "",
        startDate: "",
        status: "Active",
        contractValue: "",
        budgetTotal: "",
        approvedChangeOrders: "",
      });
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">Loading projects...</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">Projects</h1>

      <div className="card stack">
        <div className="grid-2">
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            placeholder="Client"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            placeholder="Contract value"
            value={form.contractValue}
            onChange={(e) =>
              setForm({ ...form, contractValue: e.target.value })
            }
          />
          <input
            placeholder="Budget total"
            value={form.budgetTotal}
            onChange={(e) => setForm({ ...form, budgetTotal: e.target.value })}
          />
          <input
            placeholder="Approved change orders"
            value={form.approvedChangeOrders}
            onChange={(e) =>
              setForm({ ...form, approvedChangeOrders: e.target.value })
            }
          />
        </div>

        <div>
          <button onClick={handleAddProject}>Add Project</button>
        </div>
      </div>

      <div className="list">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="card"
          >
            <div className="stack">
              <strong>{project.name}</strong>
              <div>Client: {project.client || "-"}</div>
              <div>Contract: ${project.contract_value ?? 0}</div>
              <div>Budget: ${project.budget_total ?? 0}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}