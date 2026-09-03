import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, HelpCircle, Waves, X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Chart } from "@/components/ui/chart";
import { supabase } from "@/lib/supabase";
import { getPatientSessionId } from "@/lib/patient";
import { fetchLatestPrediction, formatPrediction, type AiPredictionInfo } from "@/lib/ai-prediction";
import type { Patient } from "@/types/patient";

const historyEntries = [
  { label: "Kantong diganti", time: "08:15", dot: "bg-emerald-500" },
  { label: "Pemeriksaan rutin", time: "12:30", dot: "bg-blue-500" },
];

type SensorLog = {
  timestamp: string;
  capacitance_raw?: number;
  lig_raw?: number;
};

export function PatientDetailModal({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [handled, setHandled] = useState(false);
  const [prediction, setPrediction] = useState<AiPredictionInfo>(formatPrediction(null));

  useEffect(() => {
    const sessionId = getPatientSessionId(patient.name);
    if (!sessionId) {
      setLogs([]);
      setPrediction(formatPrediction(null));
      return;
    }
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("sensor_logs")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false })
        .limit(20);
      if (data) setLogs(data.reverse());
    };
    fetchLogs();
    fetchLatestPrediction(sessionId).then((row) => setPrediction(formatPrediction(row)));
  }, [patient.name]);

  const critical = prediction.tier === "urgent";
  const warning = prediction.tier === "warning";

  const avgMoisture = logs.length
    ? Math.round(logs.reduce((sum, log) => sum + (log.capacitance_raw ?? 0), 0) / logs.length)
    : null;
  const avgResistance = logs.length
    ? Math.round(logs.reduce((sum, log) => sum + (log.lig_raw ?? 0), 0) / logs.length)
    : null;

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-black/20 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-[600px] flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-xl font-normal text-slate-900">{patient.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Detail Pemantauan</p>
          </div>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[14px] border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
                  <Droplets size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Level Kantong</p>
                  <p className="text-2xl text-slate-900">{patient.level}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <i
                  className="block h-full rounded-full bg-blue-500"
                  style={{ width: `${patient.level}%` }}
                />
              </div>
            </div>

            <div
              className={`rounded-[14px] border p-4 ${critical ? "border-rose-100 bg-rose-50" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${critical ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}
                >
                  {prediction.tier === "unknown" ? (
                    <HelpCircle size={20} strokeWidth={1.5} />
                  ) : (
                    <AlertTriangle size={20} strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Klasifikasi AI</p>
                  <p className={`text-base leading-tight ${critical ? "text-rose-600" : prediction.tier === "unknown" ? "text-slate-500" : "text-slate-900"}`}>
                    {prediction.label}
                  </p>
                </div>
              </div>
              <p className={`mt-3 text-xs ${critical ? "text-rose-600" : "text-slate-400"}`}>
                {critical ? "Perlu perhatian segera" : warning ? "Perlu dipantau" : prediction.tier === "unknown" ? "Belum ada klasifikasi risiko" : "Dalam rentang aman"}
              </p>
            </div>
          </div>

          <section className="rounded-[14px] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <Waves size={20} strokeWidth={1.5} className="text-slate-500" />
              <div>
                <h3 className="text-[18px] font-normal text-slate-900">Analisis Hidrokoloid LIG</h3>
                <p className="text-sm text-slate-500">Pemantauan 24 jam terakhir</p>
              </div>
            </div>
            <Chart kind="resistance" data={logs} />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[14px] border border-slate-100 bg-white p-4">
              <p className="text-sm text-slate-500">Kelembaban Rata-rata</p>
              <p className="mt-1 text-[28px] text-slate-900">{avgMoisture !== null ? `${avgMoisture}%` : "—"}</p>
              <p className="mt-1 text-xs text-slate-400">
                {avgMoisture !== null ? "Dalam rentang normal" : "Belum ada device terpasang"}
              </p>
            </div>
            <div className="rounded-[14px] border border-slate-100 bg-white p-4">
              <p className="text-sm text-slate-500">Resistansi LIG</p>
              <p className="mt-1 text-[28px] text-slate-900">{avgResistance !== null ? `${avgResistance}Ω` : "—"}</p>
              <p className="mt-1 text-xs text-slate-400">
                {avgResistance !== null ? "Sensor berfungsi baik" : "Belum ada device terpasang"}
              </p>
            </div>
          </div>

          {!handled && (critical || warning) && (
            <section className="rounded-[14px] border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                  <Icon name="alert" size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-900">Rekomendasi Tindakan</h4>
                  <p className="mt-1 text-sm text-amber-800/80">
                    {critical
                      ? "Level kantong mendekati kapasitas maksimum. Disarankan untuk segera melakukan penggantian kantong dalam 30 menit ke depan untuk mencegah kebocoran."
                      : "Level kantong perlu dipantau lebih ketat dalam beberapa jam ke depan."}
                  </p>
                  <button
                    onClick={() => setHandled(true)}
                    className="mt-3 rounded-lg bg-[#e17100] px-4 py-2 text-sm font-medium text-white hover:bg-[#c1610a]"
                  >
                    Tandai Sudah Ditangani
                  </button>
                </div>
              </div>
            </section>
          )}

          <section>
            <h4 className="text-sm font-normal text-slate-900">Riwayat Hari Ini</h4>
            <ul className="mt-3 space-y-4 border-l border-slate-100 pl-4">
              {historyEntries.map((entry) => (
                <li key={entry.label} className="relative">
                  <span className={`absolute -left-[21px] top-1 size-2 rounded-full ${entry.dot}`} />
                  <p className="text-sm text-slate-700">{entry.label}</p>
                  <p className="text-xs text-slate-400">{entry.time}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
