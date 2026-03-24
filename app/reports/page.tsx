"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/lib/useLanguage";
import { supabase } from "@/app/lib/supabase";
import { ensureProfile } from "@/app/lib/profile";
import { canUseReports } from "@/app/lib/permissions";
import { getJobs, getWorkers, getReports, getTimeEntries, addReport } from "@/app/lib/db";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type JobRow = {
  id: string;
  name: string;
};

type WorkerRow = {
  id: string;
  name: string;
};

type ReportRow = {
  id: string;
  job_name: string;
  worker_name: string;
  date: string;
  workers_on_site: string | null;
  hours_worked: string | null;
  materials_used: string | null;
  work_completed: string | null;
  photo?: string | null;
};

type TimeEntryRow = {
  id: string;
  job_id: string;
  worker_name: string;
  hours_worked: number | null;
  clock_out: string | null;
};

export default function ReportsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [photo, setPhoto] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const recognitionRef = useRef<any>(null);

  const [form, setForm] = useState({
    jobId: "",
    workerName: "",
    workersOnSite: "",
    hoursWorked: "",
    materialsUsed: "",
    workCompleted: "",
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

      if (!profile || !canUseReports(profile.role)) {
        router.push("/login");
        return;
      }

      const loadedJobs = await getJobs();
      const loadedWorkers = await getWorkers();
      const loadedReports = await getReports();

      setJobs(loadedJobs);
      setWorkers(loadedWorkers);
      setReports(loadedReports);

      if (loadedJobs.length > 0) {
        setForm((prev) => ({ ...prev, jobId: loadedJobs[0].id }));
      }

      if (loadedWorkers.length > 0) {
        setForm((prev) => ({ ...prev, workerName: loadedWorkers[0].name }));
      }

      const entries = await getTimeEntries();
      const lastClosed = entries.find(
        (entry: TimeEntryRow) =>
          entry.clock_out !== null && entry.hours_worked !== null
      );

      if (lastClosed) {
        setForm((prev) => ({
          ...prev,
          jobId: lastClosed.job_id,
          workerName: lastClosed.worker_name,
          hoursWorked: String(lastClosed.hours_worked ?? ""),
        }));
      }

      setLoading(false);
    }

    loadPage();
  }, [router]);

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm((prev) => ({
        ...prev,
        workCompleted: prev.workCompleted
          ? `${prev.workCompleted} ${transcript}`
          : transcript,
      }));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoiceInput() {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }

  function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function submitReport() {
    const job = jobs.find((j) => j.id === form.jobId);

    if (!job) {
      alert(t.selectAJob);
      return;
    }

    const created = await addReport({
      job_id: job.id,
      job_name: job.name,
      worker_name: form.workerName,
      date: new Date().toLocaleDateString(),
      workers_on_site: form.workersOnSite,
      hours_worked: form.hoursWorked,
      materials_used: form.materialsUsed,
      work_completed: form.workCompleted,
      photo,
    });

    setReports((prev) => [created, ...prev]);

    setForm((prev) => ({
      ...prev,
      workersOnSite: "",
      hoursWorked: "",
      materialsUsed: "",
      workCompleted: "",
    }));
    setPhoto("");
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
      <h1 className="title">{t.dailyReports}</h1>

      <div className="card stack">
        <div className="grid-2">
          <select
            value={form.workerName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, workerName: e.target.value }))
            }
          >
            <option value="">{t.selectWorker}</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.name}>
                {worker.name}
              </option>
            ))}
          </select>

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
            placeholder={t.workersOnSite}
            value={form.workersOnSite}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, workersOnSite: e.target.value }))
            }
          />

          <input
            placeholder={t.hoursWorked}
            value={form.hoursWorked}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hoursWorked: e.target.value }))
            }
          />

          <input
            placeholder={t.materialsUsed}
            value={form.materialsUsed}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, materialsUsed: e.target.value }))
            }
          />
        </div>

        <textarea
          placeholder={t.workCompletedToday}
          value={form.workCompleted}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, workCompleted: e.target.value }))
          }
        />

        <div className="row">
          <button onClick={startVoiceInput}>
            {isListening ? t.listening : t.startVoiceReport}
          </button>

          <button className="secondary" onClick={stopVoiceInput}>
            {t.stopVoice}
          </button>
        </div>

        <input type="file" accept="image/*" onChange={handlePhotoUpload} />

        {photo && <img src={photo} alt="preview" className="image-preview" />}

        <div>
          <button onClick={submitReport}>{t.submitReport}</button>
        </div>
      </div>

      <div className="list">
        {reports.map((report) => (
          <div key={report.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{report.job_name}</strong>
              <span className="badge">{report.date}</span>
            </div>

            <div>
              <strong>{t.worker}:</strong> {report.worker_name}
            </div>

            <div>
              <strong>{t.workersOnSite}:</strong> {report.workers_on_site}
            </div>

            <div>
              <strong>{t.hoursWorked}:</strong> {report.hours_worked}
            </div>

            <div>
              <strong>{t.materialsUsed}:</strong> {report.materials_used}
            </div>

            <div>
              <strong>{t.workCompletedToday}:</strong> {report.work_completed}
            </div>

            {report.photo && (
              <img src={report.photo} alt="report" className="image-preview" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}