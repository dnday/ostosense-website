import { useState, useMemo, useEffect } from "react";
import { Search, Building, Home } from "lucide-react";
import type { Patient } from "@/types/patient";
import { PatientDetailModal } from "@/components/dashboard/patient-detail-modal";
import { getPatientSessionId } from "@/lib/patient";
import { fetchLatestPredictionsForSessions, formatPrediction, type AiPredictionRow } from "@/lib/ai-prediction";
import { fetchCalibration, DEFAULT_CALIBRATION, type Calibration } from "@/lib/calibration";
import { fetchLatestVolumeForSessions, formatFreshness, type VolumeReading } from "@/lib/volume";
export function DashboardHome({
  patients,
}: {
  patients: Patient[];
}) {
  const [predictions, setPredictions] = useState<Record<string, AiPredictionRow>>({});
  const [calibration, setCalibration] = useState<Calibration>(DEFAULT_CALIBRATION);
  const [volumes, setVolumes] = useState<Record<string, VolumeReading>>({});

  useEffect(() => {
    fetchCalibration().then(setCalibration);
  }, []);

  useEffect(() => {
    const sessionIds = patients
      .map((p) => getPatientSessionId(p.name))
      .filter((id): id is string => id !== null);
    fetchLatestPredictionsForSessions(sessionIds).then(setPredictions);
    fetchLatestVolumeForSessions(sessionIds, calibration).then(setVolumes);
  }, [patients, calibration]);

  // Level kantong live dari sensor_logs (sama dengan workspace & modal detail) —
  // bukan kolom `level` statis di tabel `patients`. Jatuh balik ke situ kalau
  // belum ada log sensor untuk pasien ini.
  const readingForPatient = (patient: Patient) => {
    const sessionId = getPatientSessionId(patient.name);
    return sessionId ? volumes[sessionId] : undefined;
  };
  const levelForPatient = (patient: Patient) => readingForPatient(patient)?.value ?? patient.level;

  const tierForPatient = (patient: Patient) => {
    const sessionId = getPatientSessionId(patient.name);
    return formatPrediction(sessionId ? predictions[sessionId] ?? null : null).tier;
  };

  // "Terhubung" = ada log sensor dalam 10 menit terakhir — dihitung dari
  // freshness yang sama dengan yang ditampilkan di kartu pasien, bukan angka baru.
  const CONNECTED_WINDOW_MS = 10 * 60 * 1000;
  const isConnected = (patient: Patient) => {
    const updatedAt = readingForPatient(patient)?.updatedAt;
    return !!updatedAt && Date.now() - new Date(updatedAt).getTime() < CONNECTED_WINDOW_MS;
  };

  const summary = useMemo(() => {
    const totalPatients = patients.length;
    const inap = patients.filter((p) => p.type === "inap").length;
    const jalan = totalPatients - inap;
    const connected = patients.filter(isConnected).length;

    const critical = patients.filter((p) => tierForPatient(p) === "urgent").length;
    const warning = patients.filter((p) => tierForPatient(p) === "warning").length;
    const normal = patients.filter((p) => tierForPatient(p) === "normal").length;
    const unavailable = patients.filter((p) => tierForPatient(p) === "unknown").length;
    const actionTotal = critical + warning;

    let globalRisk = "Rendah";
    if (critical > 0) {
      globalRisk = "Tinggi";
    } else if (warning > 0) {
      globalRisk = "Sedang";
    } else if (unavailable === totalPatients && totalPatients > 0) {
      globalRisk = "Belum diketahui";
    }

    return {
      totalPatients,
      breakdown: { inap, jalan },
      connected,
      actionNeeded: { total: actionTotal, critical, warning },
      tierCounts: { normal, warning, critical, unavailable },
      unavailable,
      globalRisk,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, predictions, volumes]);

  // Tab & pencarian
  const [activeTab, setActiveTab] = useState<"Semua" | "Perlu Tindakan" | "Rawat Inap" | "Rawat Jalan">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (activeTab === "Rawat Inap" && p.type !== "inap") return false;
      if (activeTab === "Rawat Jalan" && p.type !== "jalan") return false;
      if (activeTab === "Perlu Tindakan") {
        const tier = tierForPatient(p);
        if (tier !== "urgent" && tier !== "warning") return false;
      }
      const q = searchQuery.trim().toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, activeTab, searchQuery, predictions]);

  const tabs: { key: typeof activeTab; label: string; count: number; icon?: typeof Building }[] = [
    { key: "Semua", label: "Semua Pasien", count: summary.totalPatients },
    { key: "Perlu Tindakan", label: "Perlu Tindakan", count: summary.actionNeeded.total },
    { key: "Rawat Inap", label: "Rawat Inap", count: summary.breakdown.inap, icon: Building },
    { key: "Rawat Jalan", label: "Rawat Jalan", count: summary.breakdown.jalan, icon: Home },
  ];

  return (
    <div className="py-8 pr-12 pl-8 lg:h-[calc(100vh-105px)] lg:overflow-y-auto">
      {/* Toolbar: tab filter + pencarian, dalam satu permukaan */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                activeTab === key ? "bg-[#1d2f4a] text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}
            >
              {Icon && <Icon size={15} className={activeTab === key ? "text-white" : "text-slate-500"} />}
              {label}
              <span
                className={`inline-flex min-w-[19px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  activeTab === key
                    ? "bg-white/20 text-white"
                    : key === "Perlu Tindakan" && count > 0
                      ? "bg-rose-100 text-rose-600"
                      : "bg-white text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pasien atau lokasi..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#1d2f4a] focus:ring-1 focus:ring-[#1d2f4a]"
          />
        </div>
      </div>

      {/* Ringkasan — satu mekanisme aksen (titik warna) dipakai konsisten, bukan
          badge+ring+background beda-beda di tiap kartu. */}
      <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3" aria-label="Ringkasan pasien">
        <article className="rounded-[14px] border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Pasien Aktif</span>
          <p className="mt-2">
            <strong className="text-3xl font-semibold text-slate-900">{summary.totalPatients}</strong>{" "}
            <span className="text-sm font-medium text-slate-500">pasien terpantau</span>
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {summary.breakdown.inap} Rawat Inap · {summary.breakdown.jalan} Rawat Jalan
          </p>
          <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            <span className={`inline-block size-1.5 rounded-full ${summary.connected > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
            {summary.connected}/{summary.totalPatients} sensor terhubung
          </p>
        </article>

        <article className="rounded-[14px] border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Perlu Tindakan</span>
          <p className="mt-2">
            <strong className={`text-3xl font-semibold ${summary.actionNeeded.total > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {summary.actionNeeded.total}
            </strong>{" "}
            <span className="text-sm font-medium text-slate-500">notifikasi kritis/waspada</span>
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {summary.actionNeeded.critical} Kritis · {summary.actionNeeded.warning} Waspada
            {summary.unavailable > 0 ? ` · ${summary.unavailable} AI belum tersedia` : ""}
          </p>
          <p className={`mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium ${summary.actionNeeded.total > 0 ? "text-rose-600" : "text-slate-500"}`}>
            <span className={`inline-block size-1.5 rounded-full ${summary.actionNeeded.total > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
            {summary.actionNeeded.total > 0 ? "Perlu perhatian segera" : "Terkendali"}
          </p>
        </article>

        <article className="rounded-[14px] border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rata-rata Risiko Unit</span>
          <p className="mt-2">
            <strong
              className={`text-3xl font-semibold ${
                summary.globalRisk === "Tinggi"
                  ? "text-rose-600"
                  : summary.globalRisk === "Sedang"
                    ? "text-amber-600"
                    : summary.globalRisk === "Belum diketahui"
                      ? "text-slate-500"
                      : "text-slate-900"
              }`}
            >
              {summary.globalRisk}
            </strong>{" "}
            <span className="text-sm font-medium text-slate-500">
              ({summary.actionNeeded.total} dari {summary.totalPatients - summary.unavailable} pasien berklasifikasi)
            </span>
          </p>
          {/* Bar sebaran tier — proporsi riil dari jumlah pasien per kelas, bukan angka tren */}
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            {summary.totalPatients > 0 && (
              <>
                <div className="bg-teal-500" style={{ width: `${(summary.tierCounts.normal / summary.totalPatients) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(summary.tierCounts.warning / summary.totalPatients) * 100}%` }} />
                <div className="bg-rose-500" style={{ width: `${(summary.tierCounts.critical / summary.totalPatients) * 100}%` }} />
                <div className="bg-slate-300" style={{ width: `${(summary.tierCounts.unavailable / summary.totalPatients) * 100}%` }} />
              </>
            )}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            {summary.tierCounts.critical} Urgent · {summary.tierCounts.warning} Caution · {summary.tierCounts.normal} Aman
          </p>
        </article>
      </section>

      <div className="mt-8 mb-2 flex items-baseline justify-between">
        <h2 className="text-[18px] font-normal text-[#1d2f4a]">Daftar Pasien Terpantau</h2>
        <span className="text-xs font-medium text-slate-400">
          Menampilkan {filteredPatients.length} dari {patients.length} pasien
        </span>
      </div>

      <section className="mt-2 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const sessionId = getPatientSessionId(patient.name);
            const prediction = formatPrediction(sessionId ? predictions[sessionId] ?? null : null);
            const high = prediction.tier === "urgent";
            const level = levelForPatient(patient);

            // Ambang 80% = VOLUME_FULL_THRESHOLD nyata di backend (mqtt.service.ts).
            // Ambang 60% cuma pembagian tampilan (belum lulus jadi ambang klinis).
            const volumeBand =
              level >= 80
                ? { bar: "bg-rose-500", status: "text-rose-600", statusText: "Melebihi ambang batas (80%)", actionText: "Kosongkan segera" }
                : level >= 60
                  ? { bar: "bg-amber-500", status: "text-amber-600", statusText: "Mendekati kapasitas maksimal", actionText: "Jadwalkan cek" }
                  : { bar: "bg-teal-500", status: "text-teal-600", statusText: "Kondisi normal", actionText: "Terkontrol" };

            // Label pendek, tapi status "Simulasi"/"Eksperimental" (belum divalidasi
            // klinis) tetap ikut — jangan sampai kartu ini kelihatan seperti
            // keputusan AI final tanpa kualifikasi itu.
            const qualifier = prediction.label.startsWith("Simulasi")
              ? "Simulasi"
              : prediction.label.startsWith("AI Eksperimental")
                ? "Eksperimental"
                : null;
            const riskText =
              prediction.tier === "unknown" ? "Belum tersedia" : `${prediction.riskClass}${qualifier ? ` · ${qualifier}` : ""}`;
            const riskDot = high ? "bg-rose-500" : prediction.tier === "warning" ? "bg-amber-500" : prediction.tier === "unknown" ? "bg-slate-300" : "bg-teal-500";
            const riskColor = high ? "text-rose-700" : prediction.tier === "warning" ? "text-amber-700" : "text-slate-500";

            return (
              <article
                key={patient.name}
                className="rounded-[14px] border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">{patient.name}</h3>
                  <span className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${riskColor}`}>
                    <span className={`inline-block size-1.5 rounded-full ${riskDot}`} />
                    {riskText}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {patient.type === "inap" ? "Rawat Inap" : "Rawat Jalan"} · {patient.location}
                </p>

                <div className="mt-4 flex justify-between text-xs font-medium text-slate-500">
                  <span>Level Kantong</span>
                  <span className="font-semibold text-slate-700">{level}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <i className={`block h-full rounded-full transition-all duration-500 ${volumeBand.bar}`} style={{ width: `${level}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                  {volumeBand.statusText} — {volumeBand.actionText}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-400">
                  <span>Sensor: {formatFreshness(readingForPatient(patient)?.updatedAt)}</span>
                  {sessionId && <span className="truncate" title={sessionId}>Sesi: {sessionId}</span>}
                </div>

                <button
                  onClick={() => setDetailPatient(patient)}
                  className={`mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-left text-sm font-medium transition-colors ${
                    high ? "text-rose-600 hover:text-rose-700" : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  {high ? "Tindakan Segera" : "Detail Pasien"}
                  <span aria-hidden="true" className="text-lg leading-none">›</span>
                </button>
              </article>
            );
          })
        ) : patients.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-[14px]">
            <p className="text-slate-500 font-medium">Belum ada pasien terdaftar.</p>
            <p className="mt-1 text-sm text-slate-400">Pasien akan muncul di sini setelah terdaftar di sistem.</p>
          </div>
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-[14px]">
            <p className="text-slate-500 font-medium">Tidak ada pasien yang sesuai dengan filter.</p>
            <button onClick={() => setActiveTab("Semua")} className="mt-2 text-sm text-blue-600 hover:underline">
              Reset filter
            </button>
          </div>
        )}
      </section>

      {detailPatient && (
        <PatientDetailModal patient={detailPatient} onClose={() => setDetailPatient(null)} />
      )}
    </div>
  );
}
