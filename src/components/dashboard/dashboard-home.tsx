import { useState, useMemo, useEffect } from "react";
import { Users, AlertCircle, CheckCircle2, Activity, Building, Home } from "lucide-react";
import type { Patient } from "@/types/patient";
import { CareBadge } from "@/components/ui/care-badge";
import { PatientDetailModal } from "@/components/dashboard/patient-detail-modal";
import { getPatientSessionId } from "@/lib/patient";
import { fetchLatestPredictionsForSessions, formatPrediction, type AiPredictionRow } from "@/lib/ai-prediction";

export function DashboardHome({
  patients,
}: {
  patients: Patient[];
}) {
  const [predictions, setPredictions] = useState<Record<string, AiPredictionRow>>({});

  useEffect(() => {
    const sessionIds = patients
      .map((p) => getPatientSessionId(p.name))
      .filter((id): id is string => id !== null);
    fetchLatestPredictionsForSessions(sessionIds).then(setPredictions);
  }, [patients]);

  const tierForPatient = (patient: Patient) => {
    const sessionId = getPatientSessionId(patient.name);
    return formatPrediction(sessionId ? predictions[sessionId] ?? null : null).tier;
  };

  const summary = useMemo(() => {
    const totalPatients = patients.length;
    const inap = patients.filter((p) => p.type === "inap").length;
    const jalan = totalPatients - inap;

    const critical = patients.filter((p) => tierForPatient(p) === "urgent").length;
    const warning = patients.filter((p) => tierForPatient(p) === "warning").length;
    const unavailable = patients.filter((p) => tierForPatient(p) === "unknown").length;

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
      actionNeeded: { total: critical + warning, critical, warning },
      unavailable,
      globalRisk,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, predictions]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"Semua" | "Rawat Inap" | "Rawat Jalan">("Semua");
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (activeTab === "Semua") return true;
      if (activeTab === "Rawat Inap") return p.type === "inap";
      if (activeTab === "Rawat Jalan") return p.type === "jalan";
      return true;
    });
  }, [patients, activeTab]);

  return (
    <div className="py-8 pr-12 pl-8 lg:h-[calc(100vh-105px)] lg:overflow-y-auto">
      <section
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        aria-label="Ringkasan pasien"
      >
        <article className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Pasien</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <strong className="mt-3 block text-3xl font-semibold text-slate-900">
            {summary.totalPatients}
          </strong>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {summary.breakdown.inap} Rawat Inap • {summary.breakdown.jalan} Rawat Jalan
          </p>
        </article>

        <article className={`rounded-[14px] border bg-white p-6 shadow-sm ${summary.actionNeeded.total > 0 ? "border-orange-200 bg-orange-50/20" : "border-slate-200"}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Perlu Tindakan</span>
            {summary.actionNeeded.total > 0 ? (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <strong className={`mt-3 block text-3xl font-semibold ${summary.actionNeeded.total > 0 ? "text-orange-600" : "text-slate-900"}`}>
            {summary.actionNeeded.total}
          </strong>
          <p className={`mt-1 text-xs font-medium ${summary.actionNeeded.total > 0 ? "text-orange-600/80" : "text-slate-400"}`}>
            {summary.actionNeeded.critical} Kritis • {summary.actionNeeded.warning} Waspada
            {summary.unavailable > 0 ? ` • ${summary.unavailable} AI belum tersedia` : ""}
          </p>
        </article>

        <article className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Rata-rata Risiko Unit</span>
            <Activity className={`h-4 w-4 ${summary.globalRisk === "Tinggi" ? "text-rose-500" : summary.globalRisk === "Sedang" ? "text-amber-500" : summary.globalRisk === "Belum diketahui" ? "text-slate-400" : "text-emerald-500"}`} />
          </div>
          <strong className={`mt-3 block text-3xl font-semibold ${summary.globalRisk === "Tinggi" ? "text-rose-600" : summary.globalRisk === "Sedang" ? "text-amber-600" : summary.globalRisk === "Belum diketahui" ? "text-slate-500" : "text-slate-900"}`}>
            {summary.globalRisk}
          </strong>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {summary.globalRisk === "Tinggi" ? "Unit dalam status kritis" : summary.globalRisk === "Sedang" ? "Unit perlu perhatian" : summary.globalRisk === "Belum diketahui" ? "Belum ada klasifikasi AI" : "Kondisi stabil"}
          </p>
        </article>
      </section>

      {/* Toolbar & Tabs Matches Design Mockup */}
      <div className="mt-10 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[22px] font-normal text-[#1d2f4a]">Pemantauan Pasien</h2>

        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab("Semua")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "Semua" ? "bg-[#1d2f4a] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Semua ({summary.totalPatients})
          </button>

          <button
            onClick={() => setActiveTab("Rawat Inap")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "Rawat Inap" ? "bg-[#1d2f4a] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Building size={16} className={activeTab === "Rawat Inap" ? "text-white" : "text-slate-400"} />
            Rawat Inap ({summary.breakdown.inap})
          </button>

          <button
            onClick={() => setActiveTab("Rawat Jalan")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "Rawat Jalan" ? "bg-[#1d2f4a] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Home size={16} className={activeTab === "Rawat Jalan" ? "text-white" : "text-slate-400"} />
            Rawat Jalan ({summary.breakdown.jalan})
          </button>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const sessionId = getPatientSessionId(patient.name);
            const prediction = formatPrediction(sessionId ? predictions[sessionId] ?? null : null);
            const high = prediction.tier === "urgent";

            return (
              <article
                key={patient.name}
                className={`rounded-[14px] border bg-white p-5 shadow-sm transition-all hover:shadow-md ${high ? "border-rose-300 ring-1 ring-rose-50" : "border-slate-200"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">{patient.name}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">{patient.location}</p>
                  </div>
                  <CareBadge type={patient.type} />
                </div>

                <div className="mt-5 flex justify-between text-xs font-medium text-slate-500">
                  <span>Level Kantong</span>
                  <span className="text-slate-700">{patient.level}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <i
                    className={`block h-full rounded-full transition-all duration-500 ${high ? "bg-rose-500" : "bg-blue-500"}`}
                    style={{ width: `${patient.level}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                      high
                        ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-500/20"
                        : prediction.tier === "unknown"
                          ? "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-500/10"
                          : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10"
                    }`}
                  >
                    {prediction.label}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    • Kulit: <span className={patient.skin < 60 ? "text-amber-600" : "text-slate-500"}>{patient.skin < 60 ? "Perhatian" : "Sehat"}</span>
                  </span>
                </div>

                <button
                  onClick={() => setDetailPatient(patient)}
                  className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-left text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Lihat Detail Pasien <span aria-hidden="true" className="text-lg leading-none">›</span>
                </button>
              </article>
            );
          })
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
