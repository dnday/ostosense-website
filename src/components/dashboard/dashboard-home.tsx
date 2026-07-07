import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import type { Patient } from "@/types/patient";
import { CareBadge } from "@/components/ui/care-badge";

export function DashboardHome({
  patients,
  onOpenPatient,
}: {
  patients: Patient[];
  onOpenPatient: (name: string) => void;
}) {
  const [summary, setSummary] = useState<any>({
    totalPatients: 0,
    breakdown: { inap: 0, jalan: 0 },
    actionNeeded: { total: 0, critical: 0, warning: 0 },
    globalRisk: "Rendah",
  });

  useEffect(() => {
    // Fetch summary dari NestJS Backend
    const fetchSummary = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/dashboard-summary");
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Gagal terhubung ke backend NestJS:", err);
      }
    };
    
    fetchSummary();
    
    // Polling setiap 5 detik agar stat summary selalu terupdate jika ada data baru
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 pr-12 pl-8 lg:h-[calc(100vh-105px)] lg:overflow-y-auto">
      <section
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        aria-label="Ringkasan pasien"
      >
        <article className="rounded-[14px] border border-blue-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Icon name="users" />
            Total Pasien
          </div>
          <strong className="mt-2 block text-4xl font-normal text-[#1d2f4a]">
            {summary.totalPatients}
          </strong>
          <p className="mt-1 text-xs text-slate-400">
            {summary.breakdown.inap} Rawat Inap • {summary.breakdown.jalan} Rawat Jalan
          </p>
        </article>
        
        <article className={`rounded-[14px] border bg-white p-6 shadow-sm ${summary.actionNeeded.total > 0 ? "border-orange-300 bg-orange-50/30" : "border-emerald-200"}`}>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Icon name={summary.actionNeeded.total > 0 ? "alert" : "check"} className={summary.actionNeeded.total > 0 ? "text-orange-500" : "text-emerald-500"} />
            Perlu Tindakan
          </div>
          <strong className={`mt-2 block text-4xl font-normal ${summary.actionNeeded.total > 0 ? "text-orange-600" : "text-emerald-600"}`}>
            {summary.actionNeeded.total}
          </strong>
          <p className={`mt-1 text-xs ${summary.actionNeeded.total > 0 ? "text-orange-600" : "text-emerald-600"}`}>
            {summary.actionNeeded.critical} Kritis • {summary.actionNeeded.warning} Waspada
          </p>
        </article>
        
        <article className="rounded-[14px] border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Icon name="pulse" className={summary.globalRisk === "Tinggi" ? "text-rose-500" : summary.globalRisk === "Sedang" ? "text-amber-500" : "text-emerald-500"} />
            Rata-rata Risiko Unit
          </div>
          <strong className={`mt-2 block text-4xl font-normal ${summary.globalRisk === "Tinggi" ? "text-rose-600" : summary.globalRisk === "Sedang" ? "text-amber-600" : "text-emerald-600"}`}>
            {summary.globalRisk}
          </strong>
          <p className="mt-1 text-xs text-slate-400">
            {summary.globalRisk === "Tinggi" ? "Unit dalam status kritis" : summary.globalRisk === "Sedang" ? "Unit perlu perhatian" : "Kondisi stabil"}
          </p>
        </article>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-normal">Pemantauan Pasien (Realtime)</h2>
        <button
          onClick={() => onOpenPatient("Thomas Brown")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          Lihat semua pasien
        </button>
      </div>

      <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {patients.slice(0, 6).map((patient) => {
          const high = (patient.risk ?? 0) >= 80;

          return (
            <article
              key={patient.name}
              className={`rounded-[14px] border bg-white p-6 shadow-sm transition-all hover:shadow-md ${high ? "border-rose-400" : "border-slate-200"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-normal">{patient.name}</h3>
                <CareBadge type={patient.type} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{patient.location}</p>
              
              <div className="mt-4 flex justify-between text-xs text-slate-500">
                <span>Level Kantong</span>
                <span>{patient.level}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <i
                  className={`block h-full rounded-full transition-all duration-500 ${high ? "bg-rose-500" : "bg-[#1d2f4a]"}`}
                  style={{ width: `${patient.level}%` }}
                />
              </div>
              
              <span
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${high ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                Risiko Kebocoran {high ? "Tinggi" : "Rendah"}
              </span>
              <p className="mt-3 text-xs text-slate-400">
                Kulit: {patient.skin < 60 ? "Perhatian" : "Sehat"}
              </p>
              
              <button
                onClick={() => onOpenPatient(patient.name)}
                className="mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-left text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Lihat Detail <span aria-hidden="true">›</span>
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
