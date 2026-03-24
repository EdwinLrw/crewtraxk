"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { addSubcontractor, getSubcontractors } from "@/app/lib/projects-db";

type SubcontractorRow = {
  id: string;
  contractor_id: string | null;
  company_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  trade: string | null;
  day_rate: number | null;
  notes: string | null;
  portal_token: string | null;
};

type SubcontractorDocumentRow = {
  id: string;
  subcontractor_id: string;
  document_type: string | null;
  file_name: string | null;
  file_type: string | null;
  file_url: string | null;
  status: string | null;
  expires_at: string | null;
  created_at: string | null;
};

type ComplianceSettingsRow = {
  require_w9: boolean;
  require_insurance: boolean;
  block_payments_for_noncompliance: boolean;
};

export default function SubcontractorsPage() {
  const [subs, setSubs] = useState<SubcontractorRow[]>([]);
  const [documents, setDocuments] = useState<SubcontractorDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<ComplianceSettingsRow>({
    require_w9: true,
    require_insurance: true,
    block_payments_for_noncompliance: true,
  });

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    trade: "",
    dayRate: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const subcontractorData = await getSubcontractors();
      setSubs(subcontractorData || []);

      const { data: documentData, error: documentError } = await supabase
        .from("subcontractor_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (documentError) {
        console.error("Failed to load documents:", documentError);
      } else {
        setDocuments(documentData || []);
      }

      if (user?.id) {
        const { data: settingsData, error: settingsError } = await supabase
          .from("contractor_compliance_settings")
          .select(
            "require_w9, require_insurance, block_payments_for_noncompliance"
          )
          .eq("contractor_id", user.id)
          .single();

        if (settingsError) {
          console.log(
            "No saved compliance settings yet, using defaults:",
            settingsError.message
          );
        } else if (settingsData) {
          setSettings(settingsData);
        }
      }

      setLoading(false);
    }

    load();
  }, []);

  async function handleAddSubcontractor() {
    if (!form.companyName.trim()) return;

    const created = await addSubcontractor({
      company_name: form.companyName,
      contact_name: form.contactName,
      phone: form.phone,
      email: form.email,
      trade: form.trade,
      day_rate: form.dayRate.trim() ? Number(form.dayRate) : null,
      notes: form.notes,
    });

    if (created) {
      setSubs((prev) => [created, ...prev]);
    }

    setForm({
      companyName: "",
      contactName: "",
      phone: "",
      email: "",
      trade: "",
      dayRate: "",
      notes: "",
    });
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("subcontractor_documents")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
      return;
    }

    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status } : doc))
    );
  }

  function getStatusColor(status: string | null) {
    if (status === "approved") return "#22c55e";
    if (status === "rejected") return "#ef4444";
    return "#facc15";
  }

  function getExpiryWarning(date: string | null) {
    if (!date) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exp = new Date(`${date}T00:00:00`);

    if (exp < today) return "EXPIRED";

    const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff < 30) return "EXPIRING SOON";

    return null;
  }

  function getLatestApprovedDoc(
    docs: SubcontractorDocumentRow[],
    documentType: string
  ) {
    const matchingDocs = docs
      .filter(
        (doc) =>
          doc.document_type === documentType && doc.status === "approved"
      )
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

    return matchingDocs[0] || null;
  }

  function getComplianceResult(docs: SubcontractorDocumentRow[]) {
    const issues: string[] = [];

    const w9Doc = getLatestApprovedDoc(docs, "w9");
    const insuranceDoc = getLatestApprovedDoc(docs, "insurance");

    if (settings.require_w9 && !w9Doc) {
      issues.push("Missing W9");
    }

    if (settings.require_insurance) {
      if (!insuranceDoc) {
        issues.push("Missing insurance");
      } else if (!insuranceDoc.expires_at) {
        issues.push("Insurance missing expiration");
      } else {
        const exp = new Date(`${insuranceDoc.expires_at}T00:00:00`);
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (exp < today) {
          issues.push("Insurance expired");
        }
      }
    }

    return {
      isCompliant: issues.length === 0,
      issues,
    };
  }

  function getComplianceColor(isCompliant: boolean) {
    return isCompliant ? "#22c55e" : "#ef4444";
  }

  function canRequestPayment(isCompliant: boolean) {
    if (!settings.block_payments_for_noncompliance) return true;
    return isCompliant;
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">Loading subcontractors...</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">Subcontractors</h1>

      <div className="card stack">
        <h2 className="section-title">Add Subcontractor</h2>

        <div className="grid-2">
          <input
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, companyName: e.target.value }))
            }
          />

          <input
            placeholder="Contact name"
            value={form.contactName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, contactName: e.target.value }))
            }
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <input
            placeholder="Trade"
            value={form.trade}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, trade: e.target.value }))
            }
          />

          <input
            placeholder="Day rate"
            value={form.dayRate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, dayRate: e.target.value }))
            }
          />
        </div>

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />

        <div>
          <button onClick={handleAddSubcontractor}>Add Subcontractor</button>
        </div>
      </div>

      <div className="card stack">
        <h2 className="section-title">Compliance Rules</h2>

        <div>
          <strong>Require W9:</strong> {settings.require_w9 ? "Yes" : "No"}
        </div>

        <div>
          <strong>Require Insurance:</strong>{" "}
          {settings.require_insurance ? "Yes" : "No"}
        </div>

        <div>
          <strong>Block Payments For Non-Compliance:</strong>{" "}
          {settings.block_payments_for_noncompliance ? "Yes" : "No"}
        </div>
      </div>

      <div className="list">
        {subs.length === 0 ? (
          <div className="card">No subcontractors yet.</div>
        ) : (
          subs.map((sub) => {
            const subDocs = documents.filter(
              (doc) => doc.subcontractor_id === sub.id
            );

            const compliance = getComplianceResult(subDocs);
            const paymentAllowed = canRequestPayment(compliance.isCompliant);

            return (
              <div key={sub.id} className="card stack">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{sub.company_name}</strong>
                  <span className="badge">{sub.trade || "No trade"}</span>
                </div>

                <div
                  style={{
                    color: getComplianceColor(compliance.isCompliant),
                    fontWeight: 700,
                    marginTop: "6px",
                  }}
                >
                  COMPLIANCE:{" "}
                  {compliance.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
                </div>

                {!compliance.isCompliant && compliance.issues.length > 0 && (
                  <div
                    style={{
                      color: "#ef4444",
                      fontWeight: 700,
                      marginTop: "6px",
                    }}
                  >
                    MISSING / ISSUE: {compliance.issues.join(", ")}
                  </div>
                )}

                <div
                  style={{
                    color: paymentAllowed ? "#22c55e" : "#ef4444",
                    fontWeight: 700,
                    marginTop: "6px",
                  }}
                >
                  PAYMENT REQUESTS: {paymentAllowed ? "ALLOWED" : "BLOCKED"}
                </div>

                {!paymentAllowed && (
                  <div
                    style={{
                      color: "#ef4444",
                      marginTop: "8px",
                      fontSize: "14px",
                    }}
                  >
                    This subcontractor cannot be paid until the required
                    documents are valid.
                  </div>
                )}

                <div>
                  <strong>Contact:</strong> {sub.contact_name || "-"}
                </div>

                <div>
                  <strong>Phone:</strong> {sub.phone || "-"}
                </div>

                <div>
                  <strong>Email:</strong> {sub.email || "-"}
                </div>

                <div>
                  <strong>Day Rate:</strong> $
                  {Number(sub.day_rate || 0).toFixed(2)}
                </div>

                <div>
                  <strong>Notes:</strong> {sub.notes || "-"}
                </div>

                <div>
                  <strong>Portal Link:</strong>{" "}
                  {sub.portal_token ? (
                    <a
                      href={`/sub-portal/${sub.portal_token}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Portal
                    </a>
                  ) : (
                    "-"
                  )}
                </div>

                <div className="stack">
                  <strong>Documents:</strong>

                  {subDocs.length === 0 ? (
                    <div>No documents uploaded yet.</div>
                  ) : (
                    subDocs.map((doc) => {
                      const warning = getExpiryWarning(doc.expires_at);

                      return (
                        <div
                          key={doc.id}
                          style={{
                            border: "1px solid #333",
                            borderRadius: "10px",
                            padding: "12px",
                          }}
                        >
                          <div>
                            <strong>File:</strong> {doc.file_name || "-"}
                          </div>

                          <div>
                            <strong>Document Type:</strong>{" "}
                            {doc.document_type || "-"}
                          </div>

                          <div>
                            <strong>File Type:</strong> {doc.file_type || "-"}
                          </div>

                          <div>
                            <strong>Status:</strong>{" "}
                            <span
                              style={{
                                color: getStatusColor(doc.status),
                                fontWeight: 700,
                              }}
                            >
                              {(doc.status || "pending").toUpperCase()}
                            </span>
                          </div>

                          {warning && (
                            <div style={{ color: "#ef4444", fontWeight: 700 }}>
                              {warning}
                            </div>
                          )}

                          <div>
                            <strong>Expires:</strong> {doc.expires_at || "-"}
                          </div>

                          <div>
                            <strong>File Link:</strong>{" "}
                            {doc.file_url ? (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open File
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "10px",
                            }}
                          >
                            <button
                              onClick={() => updateStatus(doc.id, "approved")}
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => updateStatus(doc.id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}