"use client";

import { useEffect, useState } from "react";
import {
  addMaterialPurchase,
  addProjectPayment,
  addSubcontractor,
  assignSubcontractorToProject,
  assignWorkerToProject,
  getProjectAssignments,
  getProjectById,
  getProjectMaterials,
  getProjectPayments,
  getSubcontractorAssignments,
  getSubcontractors,
  getWorkers,
  updateProjectFinancials,
} from "@/app/lib/projects-db";

type Project = {
  id: string;
  name: string;
  client: string | null;
  address: string | null;
  start_date: string | null;
  status: string | null;
  contract_value: number | null;
  budget_total: number | null;
  approved_change_orders: number | null;
  labor_spent_override: number | null;
  subcontractor_spent: number | null;
  misc_spent: number | null;
};

type Payment = {
  id: string;
  amount: number | null;
  payment_date: string | null;
  payment_type: string | null;
  notes: string | null;
};

type Material = {
  id: string;
  item_name: string;
  vendor: string | null;
  quantity: number | null;
  unit_cost: number | null;
  total_cost: number | null;
  purchased_on: string | null;
  notes: string | null;
};

type Worker = {
  id: string;
  name: string;
  role: string | null;
};

type Assignment = {
  id: string;
  workers?: Worker | null;
};

type Subcontractor = {
  id: string;
  company_name: string;
  contact_name: string | null;
  trade: string | null;
};

type SubAssignment = {
  id: string;
  scope_of_work: string | null;
  contract_amount: number | null;
  subcontractors?: Subcontractor | null;
};

function money(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [subAssignments, setSubAssignments] = useState<SubAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [financialForm, setFinancialForm] = useState({
    contractValue: "",
    budgetTotal: "",
    approvedChangeOrders: "",
    laborSpentOverride: "",
    subcontractorSpent: "",
    miscSpent: "",
    status: "Active",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "",
    notes: "",
  });

  const [materialForm, setMaterialForm] = useState({
    itemName: "",
    vendor: "",
    quantity: "",
    unitCost: "",
    purchasedOn: "",
    notes: "",
  });

  const [assignWorkerId, setAssignWorkerId] = useState("");

  const [subForm, setSubForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    trade: "",
    dayRate: "",
    notes: "",
  });

  const [assignSubForm, setAssignSubForm] = useState({
    subcontractorId: "",
    scopeOfWork: "",
    contractAmount: "",
  });

  useEffect(() => {
    async function load() {
      const [p, pay, mat, allWorkers, assignedWorkers, subs, assignedSubs] =
        await Promise.all([
          getProjectById(params.id),
          getProjectPayments(params.id),
          getProjectMaterials(params.id),
          getWorkers(),
          getProjectAssignments(params.id),
          getSubcontractors(),
          getSubcontractorAssignments(params.id),
        ]);

      setProject(p);
      setPayments(pay);
      setMaterials(mat);
      setWorkers(allWorkers);
      setAssignments(assignedWorkers);
      setSubcontractors(subs);
      setSubAssignments(assignedSubs);

      setFinancialForm({
        contractValue: String(p.contract_value ?? 0),
        budgetTotal: String(p.budget_total ?? 0),
        approvedChangeOrders: String(p.approved_change_orders ?? 0),
        laborSpentOverride: String(p.labor_spent_override ?? 0),
        subcontractorSpent: String(p.subcontractor_spent ?? 0),
        miscSpent: String(p.misc_spent ?? 0),
        status: p.status ?? "Active",
      });

      if (allWorkers.length > 0) {
        setAssignWorkerId(allWorkers[0].id);
      }

      if (subs.length > 0) {
        setAssignSubForm((prev) => ({
          ...prev,
          subcontractorId: subs[0].id,
        }));
      }

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading || !project) {
    return (
      <main className="page">
        <div className="card">Loading project...</div>
      </main>
    );
  }

  const projectValue =
    Number(project.contract_value || 0) +
    Number(project.approved_change_orders || 0);

  const paymentsReceived = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const materialsSpent = materials.reduce(
    (sum, material) => sum + Number(material.total_cost || 0),
    0
  );

  const laborSpent = Number(project.labor_spent_override || 0);
  const subcontractorSpent = Number(project.subcontractor_spent || 0);
  const miscSpent = Number(project.misc_spent || 0);

  const totalSpent =
    materialsSpent + laborSpent + subcontractorSpent + miscSpent;

  const remainingToCollect = projectValue - paymentsReceived;
  const remainingBudget = Number(project.budget_total || 0) - totalSpent;
  const projectedProfit = projectValue - totalSpent;
  const grossMargin =
    projectValue > 0 ? (projectedProfit / projectValue) * 100 : 0;

  async function handleSaveFinancials() {
    const updated = await updateProjectFinancials(project.id, {
      contract_value: Number(financialForm.contractValue || 0),
      budget_total: Number(financialForm.budgetTotal || 0),
      approved_change_orders: Number(financialForm.approvedChangeOrders || 0),
      labor_spent_override: Number(financialForm.laborSpentOverride || 0),
      subcontractor_spent: Number(financialForm.subcontractorSpent || 0),
      misc_spent: Number(financialForm.miscSpent || 0),
      status: financialForm.status,
    });

    setProject(updated);
  }

  async function handleAddPayment() {
    const created = await addProjectPayment({
      project_id: project.id,
      amount: Number(paymentForm.amount || 0),
      payment_date: paymentForm.paymentDate,
      payment_type: paymentForm.paymentType,
      notes: paymentForm.notes,
    });

    setPayments((prev) => [created, ...prev]);
    setPaymentForm({
      amount: "",
      paymentDate: "",
      paymentType: "",
      notes: "",
    });
  }

  async function handleAddMaterial() {
    const quantity = Number(materialForm.quantity || 0);
    const unitCost = Number(materialForm.unitCost || 0);
    const totalCost = quantity * unitCost;

    const created = await addMaterialPurchase({
      project_id: project.id,
      item_name: materialForm.itemName,
      vendor: materialForm.vendor,
      quantity,
      unit_cost: unitCost,
      total_cost: totalCost,
      purchased_on: materialForm.purchasedOn,
      notes: materialForm.notes,
    });

    setMaterials((prev) => [created, ...prev]);
    setMaterialForm({
      itemName: "",
      vendor: "",
      quantity: "",
      unitCost: "",
      purchasedOn: "",
      notes: "",
    });
  }

  async function handleAssignWorker() {
    if (!assignWorkerId) return;

    await assignWorkerToProject({
      project_id: project.id,
      worker_id: assignWorkerId,
    });

    const fresh = await getProjectAssignments(project.id);
    setAssignments(fresh);
  }

  async function handleAddSubcontractor() {
    const created = await addSubcontractor({
      company_name: subForm.companyName,
      contact_name: subForm.contactName,
      phone: subForm.phone,
      email: subForm.email,
      trade: subForm.trade,
      day_rate: Number(subForm.dayRate || 0),
      notes: subForm.notes,
    });

    setSubcontractors((prev) => [created, ...prev]);
    setAssignSubForm((prev) => ({
      ...prev,
      subcontractorId: created.id,
    }));
    setSubForm({
      companyName: "",
      contactName: "",
      phone: "",
      email: "",
      trade: "",
      dayRate: "",
      notes: "",
    });
  }

  async function handleAssignSubcontractor() {
    if (!assignSubForm.subcontractorId) return;

    await assignSubcontractorToProject({
      project_id: project.id,
      subcontractor_id: assignSubForm.subcontractorId,
      scope_of_work: assignSubForm.scopeOfWork,
      contract_amount: Number(assignSubForm.contractAmount || 0),
    });

    const fresh = await getSubcontractorAssignments(project.id);
    setSubAssignments(fresh);

    setAssignSubForm((prev) => ({
      ...prev,
      scopeOfWork: "",
      contractAmount: "",
    }));
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="title">{project.name}</h1>
          <p className="muted">
            {project.client || "No client"}
            {project.address ? ` • ${project.address}` : ""}
          </p>
        </div>
        <span className="badge">{project.status || "Active"}</span>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="muted">Project Value</div>
          <div className="kpi">{money(projectValue)}</div>
        </div>
        <div className="card">
          <div className="muted">Payments Received</div>
          <div className="kpi">{money(paymentsReceived)}</div>
        </div>
        <div className="card">
          <div className="muted">Remaining To Collect</div>
          <div className="kpi">{money(remainingToCollect)}</div>
        </div>
        <div className="card">
          <div className="muted">Material Spend</div>
          <div className="kpi">{money(materialsSpent)}</div>
        </div>
        <div className="card">
          <div className="muted">Total Spent</div>
          <div className="kpi">{money(totalSpent)}</div>
        </div>
        <div className="card">
          <div className="muted">Projected Profit</div>
          <div className="kpi">{money(projectedProfit)}</div>
        </div>
        <div className="card">
          <div className="muted">Remaining Budget</div>
          <div className="kpi">{money(remainingBudget)}</div>
        </div>
        <div className="card">
          <div className="muted">Gross Margin</div>
          <div className="kpi">{grossMargin.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card stack">
          <h2 className="section-title">Financial Controls</h2>

          <input
            placeholder="Contract value"
            value={financialForm.contractValue}
            onChange={(e) =>
              setFinancialForm({ ...financialForm, contractValue: e.target.value })
            }
          />
          <input
            placeholder="Budget total"
            value={financialForm.budgetTotal}
            onChange={(e) =>
              setFinancialForm({ ...financialForm, budgetTotal: e.target.value })
            }
          />
          <input
            placeholder="Approved change orders"
            value={financialForm.approvedChangeOrders}
            onChange={(e) =>
              setFinancialForm({
                ...financialForm,
                approvedChangeOrders: e.target.value,
              })
            }
          />
          <input
            placeholder="Labor spent override"
            value={financialForm.laborSpentOverride}
            onChange={(e) =>
              setFinancialForm({
                ...financialForm,
                laborSpentOverride: e.target.value,
              })
            }
          />
          <input
            placeholder="Subcontractor spent"
            value={financialForm.subcontractorSpent}
            onChange={(e) =>
              setFinancialForm({
                ...financialForm,
                subcontractorSpent: e.target.value,
              })
            }
          />
          <input
            placeholder="Misc spent"
            value={financialForm.miscSpent}
            onChange={(e) =>
              setFinancialForm({
                ...financialForm,
                miscSpent: e.target.value,
              })
            }
          />
          <select
            value={financialForm.status}
            onChange={(e) =>
              setFinancialForm({ ...financialForm, status: e.target.value })
            }
          >
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>

          <button onClick={handleSaveFinancials}>Save Financial Controls</button>
        </div>

        <div className="card stack">
          <h2 className="section-title">Add Payment</h2>

          <input
            placeholder="Amount"
            value={paymentForm.amount}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, amount: e.target.value })
            }
          />
          <input
            type="date"
            value={paymentForm.paymentDate}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
            }
          />
          <input
            placeholder="Payment type"
            value={paymentForm.paymentType}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, paymentType: e.target.value })
            }
          />
          <textarea
            placeholder="Notes"
            value={paymentForm.notes}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, notes: e.target.value })
            }
          />

          <button onClick={handleAddPayment}>Add Payment</button>
        </div>
      </div>

      <div className="card stack">
        <h2 className="section-title">Add Material Purchase</h2>

        <div className="grid-2">
          <input
            placeholder="Item name"
            value={materialForm.itemName}
            onChange={(e) =>
              setMaterialForm({ ...materialForm, itemName: e.target.value })
            }
          />
          <input
            placeholder="Vendor"
            value={materialForm.vendor}
            onChange={(e) =>
              setMaterialForm({ ...materialForm, vendor: e.target.value })
            }
          />
          <input
            placeholder="Quantity"
            value={materialForm.quantity}
            onChange={(e) =>
              setMaterialForm({ ...materialForm, quantity: e.target.value })
            }
          />
          <input
            placeholder="Unit cost"
            value={materialForm.unitCost}
            onChange={(e) =>
              setMaterialForm({ ...materialForm, unitCost: e.target.value })
            }
          />
          <input
            type="date"
            value={materialForm.purchasedOn}
            onChange={(e) =>
              setMaterialForm({ ...materialForm, purchasedOn: e.target.value })
            }
          />
        </div>

        <textarea
          placeholder="Notes"
          value={materialForm.notes}
          onChange={(e) =>
            setMaterialForm({ ...materialForm, notes: e.target.value })
          }
        />

        <div>
          <button onClick={handleAddMaterial}>Add Material</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card stack">
          <h2 className="section-title">Assign Workers</h2>

          <select
            value={assignWorkerId}
            onChange={(e) => setAssignWorkerId(e.target.value)}
          >
            <option value="">Select worker</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>

          <button onClick={handleAssignWorker}>Assign Worker</button>

          <hr />

          {assignments.length === 0 ? (
            <div className="muted">No workers assigned.</div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id}>
                <strong>{assignment.workers?.name || "Unknown"}</strong>
                <div className="muted">
                  {assignment.workers?.role || "No role"}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card stack">
          <h2 className="section-title">Add Subcontractor</h2>

          <input
            placeholder="Company name"
            value={subForm.companyName}
            onChange={(e) =>
              setSubForm({ ...subForm, companyName: e.target.value })
            }
          />
          <input
            placeholder="Contact name"
            value={subForm.contactName}
            onChange={(e) =>
              setSubForm({ ...subForm, contactName: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            value={subForm.phone}
            onChange={(e) => setSubForm({ ...subForm, phone: e.target.value })}
          />
          <input
            placeholder="Email"
            value={subForm.email}
            onChange={(e) => setSubForm({ ...subForm, email: e.target.value })}
          />
          <input
            placeholder="Trade"
            value={subForm.trade}
            onChange={(e) => setSubForm({ ...subForm, trade: e.target.value })}
          />
          <input
            placeholder="Day rate"
            value={subForm.dayRate}
            onChange={(e) =>
              setSubForm({ ...subForm, dayRate: e.target.value })
            }
          />

          <textarea
            placeholder="Notes"
            value={subForm.notes}
            onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
          />

          <button onClick={handleAddSubcontractor}>Add Subcontractor</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card stack">
          <h2 className="section-title">Assign Subcontractor to Project</h2>

          <select
            value={assignSubForm.subcontractorId}
            onChange={(e) =>
              setAssignSubForm({
                ...assignSubForm,
                subcontractorId: e.target.value,
              })
            }
          >
            <option value="">Select subcontractor</option>
            {subcontractors.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.company_name}
              </option>
            ))}
          </select>

          <input
            placeholder="Scope of work"
            value={assignSubForm.scopeOfWork}
            onChange={(e) =>
              setAssignSubForm({
                ...assignSubForm,
                scopeOfWork: e.target.value,
              })
            }
          />

          <input
            placeholder="Contract amount"
            value={assignSubForm.contractAmount}
            onChange={(e) =>
              setAssignSubForm({
                ...assignSubForm,
                contractAmount: e.target.value,
              })
            }
          />

          <button onClick={handleAssignSubcontractor}>
            Assign Subcontractor
          </button>

          <hr />

          {subAssignments.length === 0 ? (
            <div className="muted">No subcontractors assigned.</div>
          ) : (
            subAssignments.map((assignment) => (
              <div key={assignment.id}>
                <strong>
                  {assignment.subcontractors?.company_name || "Unknown"}
                </strong>
                <div className="muted">
                  {assignment.scope_of_work || "No scope"} •{" "}
                  {money(Number(assignment.contract_amount || 0))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card stack">
          <h2 className="section-title">Payment Ledger</h2>

          {payments.length === 0 ? (
            <div className="muted">No payments yet.</div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="row"
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <strong>{money(Number(payment.amount || 0))}</strong>
                  <div className="muted">
                    {payment.payment_date || "-"} •{" "}
                    {payment.payment_type || "-"}
                  </div>
                </div>
                <div className="muted">{payment.notes || ""}</div>
              </div>
            ))
          )}

          <hr />

          <h2 className="section-title">Material Ledger</h2>

          {materials.length === 0 ? (
            <div className="muted">No material purchases yet.</div>
          ) : (
            materials.map((material) => (
              <div
                key={material.id}
                className="row"
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <strong>{material.item_name}</strong>
                  <div className="muted">
                    {material.vendor || "-"} • Qty {material.quantity || 0} •
                    Unit ${material.unit_cost || 0}
                  </div>
                </div>
                <div>{money(Number(material.total_cost || 0))}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}