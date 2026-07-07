import { useState, useEffect } from "react";
import { CareBadge } from "@/components/ui/care-badge";
import { Icon } from "@/components/ui/icon";
import { MetricCard } from "@/components/ui/metric-card";
import { MonitoringCard } from "@/components/ui/monitoring-card";
import { PatientRow } from "@/components/ui/patient-row";
import { clinicalNotes } from "@/data/clinical-notes";
import { getPatientDetailCardBorderClass } from "@/lib/patient";
import type { Patient } from "@/types/patient";
import { supabase } from "@/lib/supabase";

export function PatientWorkspace({
  rosterPatients,
  selectedPatient,
  selectedName,
  onSelectPatient,
}: {
  rosterPatients: Patient[];
  selectedPatient: Patient;
  selectedName: string;
  onSelectPatient: (name: string) => void;
}) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we'd filter by session_id linked to the patient.
    // For now, let's just fetch recent logs from Supabase for simulation.
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      if (data) {
        setLogs(data.reverse()); // Reverse to get chronological order for the chart
      }
    };
    fetchLogs();

    const channel = supabase
      .channel('public:sensor_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_logs' },
        (payload) => {
          setLogs((prev) => [...prev, payload.new].slice(-20)); // Keep last 20
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedName]);

  const risk = selectedPatient?.risk ?? 35;
  const isCritical = risk >= 80;
  const isWarning = risk >= 50 && risk < 80;

  return (
    <div className="py-8 pr-12 pl-8 lg:h-[calc(100vh-105px)] lg:overflow-hidden">
      <h2 className="mb-6 text-2xl font-normal leading-8">
        Daftar Semua Pasien
      </h2>
      <div className="grid gap-6 lg:h-[calc(100%-56px)] lg:grid-cols-2 lg:overflow-hidden">
        <section className="flex min-h-[530px] flex-col overflow-hidden rounded-[14px] border border-gray-200 bg-white">
          <header className="h-[81px] shrink-0 border-b border-gray-200 px-4 pt-4">
            <h3 className="text-lg font-normal tracking-[-.36px]">
              Daftar Pasien
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {rosterPatients.length} pasien • Diurutkan berdasarkan risiko
            </p>
          </header>
          <div className="flex flex-col gap-2 overflow-y-auto p-4">
            {rosterPatients.length === 0 ? (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                    <Icon name="users" size={24} />
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    Belum ada pasien
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Data pasien akan muncul di sini.
                  </p>
                </div>
              </div>
            ) : (
              rosterPatients.map((patient) => (
                <PatientRow
                  key={patient.name}
                  patient={patient}
                  selected={selectedName === patient.name}
                  onSelect={() => onSelectPatient(patient.name)}
                />
              ))
            )}
          </div>
        </section>

        <section className="overflow-y-auto rounded-[14px] border border-gray-200 bg-white">
          {rosterPatients.length === 0 ? (
            <div className="grid min-h-[530px] place-items-center px-6 text-center">
              <div>
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-blue-300">
                  <Icon name="trend" size={24} />
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  Belum ada grafik pemantauan
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Pilih pasien setelah data tersedia untuk melihat grafik.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header
                className={`border-b border-gray-200 px-6 py-6 ${
                  isCritical ? "bg-rose-50/70 border-rose-200" : isWarning ? "bg-amber-50/70 border-amber-200" : "bg-blue-50/70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-normal leading-7">
                      {selectedPatient.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPatient.location}
                    </p>
                  </div>
                  <CareBadge type={selectedPatient.type} large />
                </div>

                {isCritical ? (
                  <div className="mt-5 flex min-h-[53px] items-center gap-3 rounded-xl border-l-4 border-rose-500 bg-rose-100 px-3 text-rose-700">
                    <Icon name="alert" size={20} />
                    <div>
                      <p className="text-sm font-semibold">Status Kritis - Tindakan Segera Diperlukan</p>
                      <p className="text-xs">Monitoring ketat direkomendasikan</p>
                    </div>
                  </div>
                ) : isWarning ? (
                  <div className="mt-5 flex min-h-[53px] items-center gap-3 rounded-xl border-l-4 border-amber-500 bg-amber-100 px-3 text-amber-700">
                    <Icon name="alert" size={20} />
                    <div>
                      <p className="text-sm font-semibold">Status Waspada</p>
                      <p className="text-xs">Perhatikan tren perubahan cairan</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex min-h-[53px] items-center gap-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 px-3 text-emerald-700">
                    <Icon name="trend" size={20} />
                    <div>
                      <p className="text-sm font-semibold">Status Normal</p>
                      <p className="text-xs">Tidak ada risiko kebocoran terdeteksi</p>
                    </div>
                  </div>
                )}
              </header>
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard
                    icon="pulse"
                    label="Risiko Kebocoran"
                    value={risk}
                    color={isCritical ? "rose" : isWarning ? "amber" : "blue"}
                  />
                  <MetricCard
                    icon="drop"
                    label="Level Kantong"
                    value={selectedPatient.level}
                    color="blue"
                  />
                  <MetricCard
                    icon="heart"
                    label="Integritas Kulit"
                    value={selectedPatient.skin}
                    color="purple"
                  />
                </div>
                <MonitoringCard
                  title="Kapasitansi Sensor (AI)"
                  subtitle="Mendeteksi perubahan volume"
                  kind="moisture"
                  data={logs}
                />
                <MonitoringCard
                  title="Resistansi LIG (Fail-Safe)"
                  subtitle="Deteksi cairan langsung"
                  kind="resistance"
                  data={logs}
                />
                <section className="rounded-[14px] border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-sm font-normal">Catatan Klinis</h4>
                  <ul className="mt-3 space-y-2 text-xs text-slate-500">
                    {clinicalNotes.map((note) => (
                      <li key={note} className="flex items-center gap-2">
                        <i className="size-1.5 rounded-full bg-blue-500" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
