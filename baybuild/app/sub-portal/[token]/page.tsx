"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useParams } from "next/navigation";

type Subcontractor = {
  id: string;
  contractor_id: string | null;
  company_name: string;
  contact_name: string | null;
  trade: string | null;
};

type Assignment = {
  id: string;
  scope_of_work: string | null;
  contract_amount: number | null;
  projects?: {
    name?: string | null;
  }[] | null;
};

type DocumentRow = {
  id: string;
  subcontractor_id: string;
  document_type: string | null;
  file_name: string | null;
  file_type: string | null;
  file_url: string | null;
  status: string | null;
  expires_at: string | null;
  created_at?: string | null;
};

type ComplianceSettings = {
  require_w9: boolean;
  require_insurance: boolean;
  block_payments_for_noncompliance: boolean;
};

type UploadDocumentType = "w9" | "insurance";

export default function SubPortalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [settings, setSettings] = useState<ComplianceSettings>({
    require_w9: true,
    require_insurance: true,
    block_payments_for_noncompliance: true,
  });

  const [projectAssignmentId, setProjectAssignmentId] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [description, setDescription] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<UploadDocumentType>("w9");
  const [insuranceExpiresAt, setInsuranceExpiresAt] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function loadPortal() {
      const { data: subData, error: subError } = await supabase
        .from("subcontractors")
        .select("*")
        .eq("portal_token", token)
        .single();

      if (subError || !subData) {
        console.error("Failed to load subcontractor:", subError);
        setLoading(false);
        return;
      }

      setSubcontractor(subData);

      if (subData.contractor_id) {
        const { data: settingsData, error: settingsError } = await supabase
          .from("contractor_compliance_settings")
          .select("*")
          .eq("contractor_id", subData.contractor_id)
          .single();

        if (!settingsError && settingsData) {
          setSettings(settingsData);
        }
      }

      const { data: assignmentData, error: assignmentError } = await supabase
        .from("subcontractor_assignments")
        .select("id, scope_of_work, contract_amount, projects(name)")
        .eq("subcontractor_id", subData.id);

      if (assignmentError) {
        console.error("Failed to load assignments:", assignmentError);
      } else {
        setAssignments(assignmentData || []);
      }

      const { data: docsData, error: docsError } = await supabase
        .from("subcontractor_documents")
        .select("*")
        .eq("subcontractor_id", subData.id)
        .order("created_at", { ascending: false });

      if (docsError) {
        console.error("Failed to load documents:", docsError);
      } else {
        setDocuments(docsData || []);
      }

      setLoading(false);
    }

    loadPortal();
  }, [token]);

  function getLatestApprovedDoc(type: "w9" | "insurance") {
    return documents
      .filter((doc) => doc.document_type === type && doc.status === "approved")
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })[0];
  }

  function getCompliance() {
    const issues: string[] = [];

    const w9 = getLatestApprovedDoc("w9");
    const insurance = getLatestApprovedDoc("insurance");

    if (settings.require_w9 && !w9) {
      issues.push("Missing W9");
    }

    if (settings.require_insurance) {
      if (!insurance) {
        issues.push("Missing insurance");
      } else if (!insurance.expires_at) {
        issues.push("Insurance missing expiration");
      } else {
        const exp = new Date(`${insurance.expires_at}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

  function canRequestPayment(isCompliant: boolean) {
    if (!settings.block_payments_for_noncompliance) return true;
    return isCompliant;
  }

  function getStatusColor(status: string | null) {
    if (status === "approved") return "#22c55e";
    if (status === "rejected") return "#ef4444";
    return "#facc15";
  }

  function getExpiryLabel(expiresAt: string | null) {
    if (!expiresAt) return null;

    const exp = new Date(`${expiresAt}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (exp < today) return "EXPIRED";

    const diffDays =
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 30) return "EXPIRING SOON";

    return null;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function handleUploadDocument() {
    if (!subcontractor) return;

    if (!selectedFile) {
      alert("Choose a file first");
      return;
    }

    if (documentType === "insurance" && !insuranceExpiresAt) {
      alert("Enter the insurance expiration date");
      return;
    }

    setUploadingDocument(true);

    const safeFileName = selectedFile.name.replace(/\s+/g, "-");
    const filePath = `${subcontractor.id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("subcontractor-documents")
      .upload(filePath, selectedFile, {
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      alert(uploadError.message);
      setUploadingDocument(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("subcontractor-documents")
      .getPublicUrl(filePath);

    const { data: insertedDoc, error: insertError } = await supabase
      .from("subcontractor_documents")
      .insert({
        subcontractor_id: subcontractor.id,
        document_type: documentType,
        file_name: selectedFile.name,
        file_type: selectedFile.type || null,
        file_url: publicUrlData.publicUrl,
        status: "pending",
        expires_at: documentType === "insurance" ? insuranceExpiresAt : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save document row:", insertError);
      alert(insertError.message);
      setUploadingDocument(false);
      return;
    }

    setDocuments((prev) => [insertedDoc, ...prev]);
    setSelectedFile(null);
    setDocumentType("w9");
    setInsuranceExpiresAt("");
    setUploadingDocument(false);

    const fileInput = document.getElementById(
      "subcontractor-document-upload"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }

    alert("Document uploaded. It will stay pending until approved.");
  }

  async function handleSubmitPaymentRequest() {
    if (!subcontractor) return;

    const compliance = getCompliance();

    if (!canRequestPayment(compliance.isCompliant)) {
      alert(`Blocked: ${compliance.issues.join(", ")}`);
      return;
    }

    if (!projectAssignmentId || !amountRequested) {
      alert("Select project and amount");
      return;
    }

    setSubmittingPayment(true);

    const selectedAssignment = assignments.find(
      (assignment) => assignment.id === projectAssignmentId
    );

    const projectName = selectedAssignment?.projects?.[0]?.name || null;

    const { error } = await supabase.from("subcontractor_payment_requests").insert({
      subcontractor_id: subcontractor.id,
      project_id: projectAssignmentId,
      amount: Number(amountRequested),
      notes: description,
      status: "pending",
      request_date: new Date().toISOString().slice(0, 10),
      project_name: projectName,
    });

    if (error) {
      console.error("Failed to submit payment request:", error);
      alert(error.message);
      setSubmittingPayment(false);
      return;
    }

    setSubmittingPayment(false);
    setAmountRequested("");
    setDescription("");
    setProjectAssignmentId("");

    alert("Payment request submitted");
  }

  const compliance = useMemo(() => getCompliance(), [documents, settings]);
  const paymentAllowed = canRequestPayment(compliance.isCompliant);

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!subcontractor) {
    return <div className="page">Invalid portal link</div>;
  }

  return (
    <main className="stack">
      <h1>Subcontractor Portal</h1>

      <div className="card">
        <h2>{subcontractor.company_name}</h2>

        <div style={{ marginTop: "8px" }}>
          <strong>Contact:</strong> {subcontractor.contact_name || "-"}
        </div>

        <div style={{ marginTop: "8px" }}>
          <strong>Trade:</strong> {subcontractor.trade || "-"}
        </div>

        <div
          style={{
            marginTop: "12px",
            color: compliance.isCompliant ? "#22c55e" : "#ef4444",
            fontWeight: 700,
          }}
        >
          COMPLIANCE: {compliance.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
        </div>

        {!compliance.isCompliant && (
          <div style={{ marginTop: "8px", color: "#ef4444" }}>
            {compliance.issues.join(", ")}
          </div>
        )}

        <div
          style={{
            marginTop: "12px",
            color: paymentAllowed ? "#22c55e" : "#ef4444",
            fontWeight: 700,
          }}
        >
          PAYMENT REQUESTS: {paymentAllowed ? "ALLOWED" : "BLOCKED"}
        </div>
      </div>

      <div className="card">
        <h2>Upload Required Documents</h2>

        <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
          <select
            value={documentType}
            onChange={(e) =>
              setDocumentType(e.target.value as UploadDocumentType)
            }
          >
            <option value="w9">W9</option>
            <option value="insurance">Insurance</option>
          </select>

          {documentType === "insurance" && (
            <input
              type="date"
              value={insuranceExpiresAt}
              onChange={(e) => setInsuranceExpiresAt(e.target.value)}
            />
          )}

          <input
            id="subcontractor-document-upload"
            type="file"
            onChange={handleFileChange}
          />

          <button disabled={uploadingDocument} onClick={handleUploadDocument}>
            {uploadingDocument ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        <div style={{ marginTop: "14px", fontSize: "14px", color: "#9ca3af" }}>
          Uploaded documents stay pending until the contractor approves them.
        </div>
      </div>

      <div className="card">
        <h2>Documents</h2>

        <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
          {documents.length === 0 ? (
            <div>No documents uploaded yet.</div>
          ) : (
            documents.map((doc) => {
              const expiryLabel = getExpiryLabel(doc.expires_at);

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
                    <strong>Type:</strong> {doc.document_type || "-"}
                  </div>

                  <div>
                    <strong>File:</strong> {doc.file_name || "-"}
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

                  <div>
                    <strong>Expires:</strong> {doc.expires_at || "-"}
                  </div>

                  {expiryLabel && (
                    <div style={{ color: "#ef4444", fontWeight: 700 }}>
                      {expiryLabel}
                    </div>
                  )}

                  <div>
                    <strong>Open File:</strong>{" "}
                    {doc.file_url ? (
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="card">
        <h2>Submit Payment Request</h2>

        {!paymentAllowed && (
          <div style={{ color: "#ef4444", marginBottom: "12px" }}>
            Payment requests are blocked until required documents are approved
            and valid.
          </div>
        )}

        <div style={{ display: "grid", gap: "12px" }}>
          <select
            disabled={!paymentAllowed}
            value={projectAssignmentId}
            onChange={(e) => setProjectAssignmentId(e.target.value)}
          >
            <option value="">Select project</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.projects?.[0]?.name || "Project"}
              </option>
            ))}
          </select>

          <input
            disabled={!paymentAllowed}
            placeholder="Amount"
            value={amountRequested}
            onChange={(e) => setAmountRequested(e.target.value)}
          />

          <textarea
            disabled={!paymentAllowed}
            placeholder="Notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            disabled={!paymentAllowed || submittingPayment}
            onClick={handleSubmitPaymentRequest}
          >
            {submittingPayment ? "Submitting..." : "Submit Payment Request"}
          </button>
        </div>
      </div>
    </main>
  );
}