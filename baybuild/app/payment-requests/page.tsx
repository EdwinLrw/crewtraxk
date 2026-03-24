"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type RequestRow = {
  id: string;
  amount: number | null;
  request_date: string | null;
  status: string | null;
  notes: string | null;
};

function money(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function PaymentRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("subcontractor_payment_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setRows(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="page">
        <div className="card">Loading payment requests...</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">Subcontractor Payment Requests</h1>

      {rows.length === 0 ? (
        <div className="card">No payment requests yet.</div>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="card">
            <strong>{money(Number(row.amount || 0))}</strong>
            <div>{row.request_date || "-"}</div>
            <div>{row.status || "requested"}</div>
            <div>{row.notes || "-"}</div>
          </div>
        ))
      )}
    </main>
  );
}