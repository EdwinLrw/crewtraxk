"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/app/lib/projects-db";

type Project = {
  id: string;
  name: string;
  client: string | null;
  contract_value: number | null;
  budget_total: number | null;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      const data = await getProjectById(projectId);
      setProject(data);
    }
    load();
  }, [projectId]);

  if (!project) {
    return (
      <main className="page">
        <div className="card">Loading project...</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <Link href="/projects">← Back</Link>

      <div className="card stack">
        <h1>{project.name}</h1>
        <div>Client: {project.client || "-"}</div>
        <div>Contract: ${project.contract_value ?? 0}</div>
        <div>Budget: ${project.budget_total ?? 0}</div>
      </div>
    </main>
  );
}