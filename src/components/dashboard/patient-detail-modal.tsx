import { useEffect, useState } from "react";
import { AlertTriangle, Download, Droplets, HelpCircle, Waves, X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Chart } from "@/components/ui/chart";
import { supabase } from "@/lib/supabase";
import { getPatientSessionId } from "@/lib/patient";
import { fetchLatestPrediction, formatPrediction, type AiPredictionInfo } from "@/lib/ai-prediction";
import { fetchCalibration, DEFAULT_CALIBRATION, type Calibration } from "@/lib/calibration";
import { volumePct, formatFreshness } from "@/lib/volume";
import type { Patient } from "@/types/patient";

const LIG_SMOOTH_WINDOW = 5;

const historyEntries = [
  { label: "Kantong diganti", time: "08:15", dot: "bg-emerald-500" },
  { label: "Pemeriksaan rutin", time: "12:30", dot: "bg-blue-500" },
];

type SensorLog = {
  timestamp: string;
  capacitance_raw?: number;
  lig_raw?: number;
  res_15_raw?: number;
  res_16_raw?: number;
  kap_4_raw?: number;
  kap_5_raw?: number;
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
  const [calibration, setCalibration] = useState<Calibration>(DEFAULT_CALIBRATION);

  useEffect(() => {
    fetchCalibration().then(setCalibration);
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

    // Modal ini sebelumnya cuma fetch sekali pas dibuka lalu diam — sensor terus
    // ngirim data (device kirim tiap ~1 detik) tapi layar gak pernah update sampai
    // modal ditutup-buka lagi. Sama seperti roster (patient-workspace.tsx): dengarkan
    // INSERT baru lewat Supabase Realtime.
    const channel = supabase
      .channel(`patient-detail:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_logs", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setLogs((prev) => [...prev, payload.new as SensorLog].slice(-20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patient.name]);

  const critical = prediction.tier === "urgent";
  const warning = prediction.tier === "warning";

  // Res_15 (elektroda DALAM baseplate) = failsafe/deteksi dini, Res_16 (elektroda
  // LUAR baseplate) = kebocoran hampir/sedang menembus keluar — dua sinyal fisik
  // berbeda, ditampilkan terpisah (bukan dirata-rata jadi satu "lig_raw" lagi).
  // Kap_7 dikunci sebagai kanal volume; Kap_4 (dalam) dan Kap_5 (luar)
  // merepresentasikan kelembapan di dua posisi baseplate yang sama seperti
  // Res_15/Res_16 (sensor identik, cuma beda posisi dalam/luar). Nilainya mentah
  // (Ω / raw ADC), belum dikalibrasi jadi persentase — belum ada dasar
  // biofisika/klinis tervalidasi untuk itu.
  const last = logs[logs.length - 1];

  // Sample-per-sample sangat berisik (data pilot: lompat 1 -> 1194 -> 3 antar sample
  // berturut-turut) — rata-ratakan LIG_SMOOTH_WINDOW sample terakhir per channel,
  // konsisten dengan mobile app & backend.
  const recent = logs.slice(-LIG_SMOOTH_WINDOW);
  const avg = (pick: (log: SensorLog) => number | undefined) =>
    recent.length ? Math.round(recent.reduce((sum, log) => sum + (pick(log) ?? 0), 0) / recent.length) : null;
  const failsafeResistance = avg((log) => log.res_15_raw);
  const leakResistance = avg((log) => log.res_16_raw);

  // Level volume kantong dari bacaan kapasitif terakhir (sama dengan mobile app) —
  // bukan kolom `level` statis. Jatuh balik ke situ kalau belum ada log sensor.
  const bagLevel = last?.capacitance_raw != null ? volumePct(last.capacitance_raw, calibration) : patient.level;

  // Ambang sama dengan roster & workspace (80%/60% = VOLUME_FULL_THRESHOLD nyata di backend).
  const bagLevelBand = bagLevel >= 80 ? "rose" : bagLevel >= 60 ? "amber" : "blue";
  const isConnected = !!last && Date.now() - new Date(last.timestamp).getTime() < 10 * 60 * 1000;

  // Tren riil dari selisih sampel pertama-terakhir yang sudah dimuat.
  let bagLevelTrend: string | null = null;
  if (logs.length >= 2) {
    const first = logs[0];
    if (first.capacitance_raw != null && last?.capacitance_raw != null) {
      const delta = volumePct(last.capacitance_raw, calibration) - volumePct(first.capacitance_raw, calibration);
      const minutes = Math.round((new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 60000);
      if (minutes > 0 && delta !== 0) {
        bagLevelTrend = `${delta > 0 ? "+" : ""}${delta}% / ${minutes} mnt`;
      }
    }
  }

  const exportCsv = () => {
    if (!logs.length) return;
    const headers = Object.keys(logs[0]);
    const rows = logs.map((log: any) => headers.map((h) => JSON.stringify(log[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getPatientSessionId(patient.name) ?? "pasien"}-sensor-logs.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className={`inline-block size-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
              Data sensor: {formatFreshness(last?.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={!logs.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              Ekspor
            </button>
            <button
              aria-label="Tutup"
              onClick={onClose}
              className="grid size-8 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`rounded-[14px] border p-4 ${
                bagLevelBand === "rose" ? "border-rose-100 bg-rose-50" : bagLevelBand === "amber" ? "border-amber-100 bg-amber-50" : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${
                    bagLevelBand === "rose" ? "bg-rose-100 text-rose-600" : bagLevelBand === "amber" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Droplets size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Level Kantong</p>
                  <p className="text-2xl text-slate-900">
                    {bagLevel}% {bagLevelTrend && <span className="text-xs font-medium text-slate-500">({bagLevelTrend})</span>}
                  </p>
                </div>
              </div>
              <div className={`mt-3 h-2 overflow-hidden rounded-full ${bagLevelBand === "rose" ? "bg-rose-100" : bagLevelBand === "amber" ? "bg-amber-100" : "bg-blue-100"}`}>
                <i
                  className={`block h-full rounded-full ${bagLevelBand === "rose" ? "bg-rose-500" : bagLevelBand === "amber" ? "bg-amber-500" : "bg-blue-500"}`}
                  style={{ width: `${bagLevel}%` }}
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
              <p className={`mt-3 text-xs ${critical ? "text-rose-600" : "text-slate-500"}`}>
                {critical ? "Perlu perhatian segera" : warning ? "Perlu dipantau" : prediction.tier === "unknown" ? "Belum ada klasifikasi risiko" : "Dalam rentang aman"}
              </p>
            </div>
          </div>

          <section className="rounded-[14px] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <Waves size={20} strokeWidth={1.5} className="text-slate-500" />
              <div>
                <h3 className="text-[18px] font-normal text-slate-900">Bacaan Sensor LIG (mentah)</h3>
                <p className="text-sm text-slate-500">Belum ada interpretasi klinis tervalidasi — lihat OSTOSENSE-AI</p>
              </div>
            </div>
            <Chart kind="resistance" data={logs} />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[14px] border border-slate-100 bg-white p-4">
              <p className="text-sm text-slate-500">Failsafe (dalam baseplate)</p>
              <p className="mt-1 text-[28px] text-slate-900">{failsafeResistance !== null ? `${failsafeResistance}Ω` : "—"}</p>
              <p className="mt-1 text-xs text-slate-500">Res_15 — deteksi dini kontak cairan</p>
            </div>
            <div className="rounded-[14px] border border-slate-100 bg-white p-4">
              <p className="text-sm text-slate-500">Kebocoran (luar baseplate)</p>
              <p className="mt-1 text-[28px] text-slate-900">{leakResistance !== null ? `${leakResistance}Ω` : "—"}</p>
              <p className="mt-1 text-xs text-slate-500">Res_16 — cairan hampir/sedang menembus keluar</p>
            </div>
          </div>

          {last && (
            <section className="rounded-[14px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelembapan Baseplate (mentah)</p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-[11px] text-slate-500">Kelembapan (dalam)</p>
                  <p className="text-sm font-semibold text-slate-700">{last.kap_4_raw ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Kelembapan (luar)</p>
                  <p className="text-sm font-semibold text-slate-700">{last.kap_5_raw ?? "—"}</p>
                </div>
              </div>
            </section>
          )}

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
                  <p className="text-xs text-slate-500">{entry.time}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
