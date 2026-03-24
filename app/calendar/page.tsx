"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addScheduleEvent,
  getProjects,
  getScheduleEvents,
  getSubcontractors,
} from "@/app/lib/projects-db";
import { getWorkers } from "@/app/lib/db";

type ProjectRow = {
  id: string;
  name: string;
};

type WorkerRow = {
  id: string;
  name: string;
};

type SubRow = {
  id: string;
  company_name: string;
};

type EventRow = {
  id: string;
  title: string;
  event_type: string | null;
  status: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  project_id: string | null;
  assigned_worker_id: string | null;
  assigned_subcontractor_id: string | null;
};

export default function CalendarPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    projectId: "",
    workerId: "",
    subcontractorId: "",
    eventType: "work",
    status: "scheduled",
    startDate: "",
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const [projectData, workerData, subData, eventData] = await Promise.all([
        getProjects(),
        getWorkers(),
        getSubcontractors(),
        getScheduleEvents(),
      ]);

      setProjects(projectData);
      setWorkers(workerData);
      setSubs(subData);
      setEvents(eventData);
      setLoading(false);
    }

    load();
  }, []);

  const groupedEvents = useMemo(() => {
    const grouped: Record<string, EventRow[]> = {};

    for (const event of events) {
      const key = event.start_date || "No date";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    }

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  async function handleAddEvent() {
    if (!form.title.trim() || !form.startDate) return;

    const created = await addScheduleEvent({
      project_id: form.projectId || null,
      assigned_worker_id: form.workerId || null,
      assigned_subcontractor_id: form.subcontractorId || null,
      title: form.title,
      event_type: form.eventType,
      status: form.status,
      start_date: form.startDate,
      end_date: form.endDate || null,
      notes: form.notes,
    });

    setEvents((prev) => [...prev, created].sort((a, b) => a.start_date.localeCompare(b.start_date)));

    setForm({
      title: "",
      projectId: "",
      workerId: "",
      subcontractorId: "",
      eventType: "work",
      status: "scheduled",
      startDate: "",
      endDate: "",
      notes: "",
    });
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">Loading calendar...</div>
      </main>
    );
  }

  return (
    <main className="stack">
      <h1 className="title">Calendar</h1>

      <div className="card stack">
        <h2 className="section-title">Add Schedule Event</h2>

        <div className="grid-2">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={form.workerId}
            onChange={(e) => setForm({ ...form, workerId: e.target.value })}
          >
            <option value="">Assign worker</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>

          <select
            value={form.subcontractorId}
            onChange={(e) =>
              setForm({ ...form, subcontractorId: e.target.value })
            }
          >
            <option value="">Assign subcontractor</option>
            {subs.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.company_name}
              </option>
            ))}
          </select>

          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          >
            <option value="work">Work</option>
            <option value="inspection">Inspection</option>
            <option value="delivery">Delivery</option>
            <option value="meeting">Meeting</option>
            <option value="payment_due">Payment Due</option>
          </select>

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="delayed">Delayed</option>
          </select>

          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />

          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div>
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      </div>

      <div className="stack">
        {groupedEvents.length === 0 ? (
          <div className="card">No schedule events yet.</div>
        ) : (
          groupedEvents.map(([date, rows]) => (
            <div key={date} className="card stack">
              <h2 className="section-title">{date}</h2>
              {rows.map((event) => (
                <div
                  key={event.id}
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div>
                    <strong>{event.title}</strong>
                    <div className="muted">
                      {event.event_type || "work"} • {event.status || "scheduled"}
                    </div>
                  </div>
                  <div className="muted">{event.end_date || ""}</div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </main>
  );
}