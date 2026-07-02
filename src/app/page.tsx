"use client";

import { useState } from "react";

type IconName = "alert" | "bed" | "bell" | "door" | "drop" | "gear" | "heart" | "home" | "pulse" | "sun" | "trend" | "users";

function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></>,
    bed: <><path d="M3 19v-8h18v8M3 15h18M7 11V7h5a3 3 0 0 1 3 3v1" /><path d="M3 11V5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    door: <><path d="M14 8V5a2 2 0 0 0-2-2H5v18h7a2 2 0 0 0 2-2v-3" /><path d="M10 12h11m-3-3 3 3-3 3" /></>,
    drop: <path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10Z" />,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    heart: <path d="M12 21s-7-4.4-7-11a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 6.6-7 11-7 11Z" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    pulse: <><path d="M12 21s-7-4.4-7-11a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 6.6-7 11-7 11Z" /><path d="M8 13h2l1-3 2 6 1-3h2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  };
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

type Patient = { name: string; type: "inap" | "jalan"; location: string; risk?: number; level: number; skin: number };

const patients: Patient[] = [
  { name: "John Martinez", type: "inap", location: "Tempat Tidur 12", risk: 92, level: 85, skin: 54 },
  { name: "Thomas Brown", type: "jalan", location: "Rumah", risk: 88, level: 88, skin: 60 },
  { name: "Emily Johnson", type: "inap", location: "Tempat Tidur 7", risk: 75, level: 78, skin: 72 },
  { name: "Michael Chen", type: "inap", location: "Tempat Tidur 3", risk: 58, level: 52, skin: 68 },
  { name: "Sarah Williams", type: "jalan", location: "Rumah", level: 30, skin: 82 },
  { name: "David Thompson", type: "inap", location: "Tempat Tidur 8", level: 18, skin: 80 },
  { name: "Lisa Anderson", type: "jalan", location: "Rumah", level: 25, skin: 85 },
  { name: "Robert Garcia", type: "inap", location: "Tempat Tidur 11", level: 44, skin: 74 },
  { name: "Jennifer Lee", type: "jalan", location: "Rumah", level: 37, skin: 88 },
  { name: "Maria Garcia", type: "jalan", location: "Rumah", level: 41, skin: 78 },
];

// Data roster sengaja dikosongkan sampai terhubung ke sumber data pasien.
const rosterPatients: Patient[] = [];

function CareBadge({ type, large = false }: { type: Patient["type"]; large?: boolean }) {
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded ${large ? "h-9 px-3 text-sm" : "h-5 px-2 text-xs"} ${type === "inap" ? "bg-purple-50 text-purple-600" : large ? "bg-blue-100 text-blue-600" : "bg-blue-50 text-slate-700"}`}>
    <Icon name={type === "inap" ? "bed" : "home"} size={large ? 16 : 12} />{type === "inap" ? "Rawat Inap" : "Rawat Jalan"}
  </span>;
}

function PatientRow({ patient, selected, onSelect }: { patient: Patient; selected: boolean; onSelect: () => void }) {
  const urgent = (patient.risk ?? 0) >= 80;
  const warning = !urgent && (patient.risk ?? 0) >= 50;
  const tone = urgent ? "border-rose-400 bg-rose-50" : warning ? "border-orange-400 bg-amber-50" : "border-slate-200 bg-white";
  const accent = urgent ? "text-rose-500" : warning ? "text-orange-400" : "text-emerald-500";
  return <button aria-pressed={selected} onClick={onSelect} className={`h-[74px] w-full shrink-0 rounded-[10px] border text-left transition hover:brightness-[.99] ${tone} ${selected ? "shadow-[inset_0_0_0_1px_rgba(244,63,94,0.18)]" : ""}`}>
    <span className="flex h-full items-start justify-between px-4 py-4">
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <i className={`size-2 shrink-0 rounded-full bg-current ${accent}`} />
          <span className="truncate text-sm tracking-[-.28px] text-slate-900">{patient.name}</span>
          <CareBadge type={patient.type} />
        </span>
        <span className="mt-1 block pl-4 text-xs text-slate-500">{patient.location}</span>
      </span>
      {patient.risk && <span className={`flex items-center gap-1 text-xs ${accent}`}><Icon name="alert" size={16} />{patient.risk}%</span>}
    </span>
  </button>;
}

function MetricCard({ icon, label, value, color }: { icon: IconName; label: string; value: number; color: "rose" | "blue" | "purple" }) {
  const themes = {
    rose: "border-rose-200 bg-rose-50 text-rose-500 [&_.bar]:bg-rose-500",
    blue: "border-blue-200 bg-blue-50 text-blue-600 [&_.bar]:bg-blue-500",
    purple: "border-purple-200 bg-purple-50 text-purple-600 [&_.bar]:bg-purple-500",
  };
  return <div className={`h-[104px] rounded-[14px] border p-3 ${themes[color]}`}>
    <div className="flex items-center gap-2"><Icon name={icon} size={16} /><span className="text-xs leading-4 text-slate-500">{label}</span></div>
    <strong className="mt-2 block text-2xl font-normal text-slate-900">{value}%</strong>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80"><i className="bar block h-full rounded-full" style={{ width: `${value}%` }} /></div>
  </div>;
}

function Chart({ kind }: { kind: "moisture" | "resistance" }) {
  const blue = kind === "moisture";
  const path = blue
    ? "M66 61 C72 29 80 92 91 54 S104 31 111 62 S125 72 139 74 S157 82 168 53 S181 84 190 67 S200 38 210 75 S220 86 229 55 S242 80 251 62 S262 85 270 77 S282 35 294 54 S309 85 321 73 S335 30 346 43 S365 43 380 46 L390 76"
    : "M66 53 C79 47 91 62 105 44 S129 35 143 52 S166 63 181 41 S207 35 222 48 S246 66 262 43 S290 36 306 48 S337 63 355 38 S375 42 390 50";
  return <svg className="mt-2 h-[180px] w-full" viewBox="0 0 410 180" preserveAspectRatio="none" aria-label={blue ? "Grafik kelembaban" : "Grafik resistansi kulit"}>
    {[20, 55, 90, 125, 160].map((y, i) => <g key={y}><line x1="65" y1={y} x2="390" y2={y} stroke="#dbe4ee" strokeDasharray="3 3" /><text x="53" y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{80 - i * 20}</text></g>)}
    {[78, 119, 160, 201, 242, 283, 324, 380].map((x, i) => <g key={x}><line x1={x} y1="20" x2={x} y2="160" stroke="#dbe4ee" strokeDasharray="3 3" /><text x={x} y="176" textAnchor="middle" fontSize="9" fill="#64748b">{["01:00", "04:00", "07:00", "10:00", "13:00", "16:00", "19:00", "23:00"][i]}</text></g>)}
    <path d={path} fill="none" stroke={blue ? "#008bd2" : "#a23bf0"} strokeWidth="2" strokeLinecap="round" />
    <text x="12" y="105" transform="rotate(-90 12 105)" fontSize="10" fill="#64748b">{blue ? "Kelembaban (%)" : "Resistansi (kΩ)"}</text>
  </svg>;
}

function MonitoringCard({ title, subtitle, kind }: { title: string; subtitle: string; kind: "moisture" | "resistance" }) {
  const moisture = kind === "moisture";
  return <section className="rounded-[14px] border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <div><h4 className="text-sm font-normal text-slate-900">{title}</h4><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>
      <span className={`inline-flex h-7 items-center gap-2 rounded-[10px] px-3 text-xs ${moisture ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-700"}`}><Icon name={moisture ? "trend" : "pulse"} size={16} />{moisture ? "Normal" : "Stabil"}</span>
    </div>
    <Chart kind={kind} />
  </section>;
}

function DashboardHome({ onOpenPatient }: { onOpenPatient: (name: string) => void }) {
  return <div className="py-8 pr-12 pl-8 lg:h-[calc(100vh-105px)] lg:overflow-y-auto">
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="Ringkasan pasien">
      <article className="rounded-[14px] border border-blue-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500"><Icon name="users" />Total Pasien</div>
        <strong className="mt-2 block text-4xl font-normal text-[#1d2f4a]">11</strong>
        <p className="mt-1 text-xs text-slate-400">6 Rawat Inap • 5 Rawat Jalan</p>
      </article>
      <article className="rounded-[14px] border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500"><Icon name="alert" className="text-orange-500" />Perlu Tindakan</div>
        <strong className="mt-2 block text-4xl font-normal text-orange-600">3</strong>
        <p className="mt-1 text-xs text-orange-600">2 RS • 1 Rawat Jalan</p>
      </article>
      <article className="rounded-[14px] border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500"><Icon name="pulse" className="text-emerald-500" />Rata-rata Risiko Unit</div>
        <strong className="mt-2 block text-4xl font-normal text-emerald-600">Rendah</strong>
        <p className="mt-1 text-xs text-slate-400">Kondisi stabil</p>
      </article>
    </section>
    <div className="mt-8 flex items-center justify-between">
      <h2 className="text-lg font-normal">Pemantauan Pasien</h2>
      <button onClick={() => onOpenPatient("Thomas Brown")} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50">Lihat semua pasien</button>
    </div>
    <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {patients.slice(0, 6).map((patient) => {
        const high = (patient.risk ?? 0) >= 80;
        return <article key={patient.name} className={`rounded-[14px] border bg-white p-6 shadow-sm ${high ? "border-rose-400" : "border-slate-200"}`}>
          <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-normal">{patient.name}</h3><CareBadge type={patient.type} /></div>
          <p className="mt-1 text-sm text-slate-500">{patient.location}</p>
          <div className="mt-4 flex justify-between text-xs text-slate-500"><span>Level Kantong</span><span>{patient.level}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><i className={`block h-full rounded-full ${high ? "bg-orange-400" : "bg-[#1d2f4a]"}`} style={{ width: `${patient.level}%` }} /></div>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs ${high ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"}`}>Risiko Kebocoran {high ? "Tinggi" : "Rendah"}</span>
          <p className="mt-3 text-xs text-slate-400">Kulit: {patient.skin < 60 ? "Perhatian" : "Sehat"}</p>
          <button onClick={() => onOpenPatient(patient.name)} className="mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-left text-sm text-[#1d2f4a]">Lihat Detail <span aria-hidden="true">›</span></button>
        </article>;
      })}
    </section>
  </div>;
}

export default function Home() {
  const [view, setView] = useState<"home" | "patients">("home");
  const [selectedName, setSelectedName] = useState("Thomas Brown");
  const selected = patients.find((patient) => patient.name === selectedName) ?? patients[1];
  const openPatient = (name: string) => { setSelectedName(name); setView("patients"); };

  return <main className="min-h-screen bg-slate-50 font-sans text-slate-950 lg:h-screen lg:overflow-hidden">
    <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col items-center gap-8 bg-[#1d2f4a] py-8 text-slate-300">
      <div className="grid size-10 place-items-center rounded-[14px] bg-white/20 text-white"><Icon name="pulse" size={24} /></div>
      <nav className="flex flex-1 flex-col gap-4" aria-label="Navigasi utama">
        <button aria-label="Beranda" onClick={() => setView("home")} className={`grid size-12 place-items-center rounded-[14px] hover:bg-white/10 ${view === "home" ? "bg-white/20 text-white" : ""}`}><Icon name="home" /></button>
        <button aria-label="Daftar pasien" onClick={() => setView("patients")} className={`grid size-12 place-items-center rounded-[14px] hover:bg-white/10 ${view === "patients" ? "bg-white/20 text-white" : ""}`}><Icon name="users" /></button>
        <button aria-label="Notifikasi" className="grid size-12 place-items-center rounded-[14px] hover:bg-white/10"><Icon name="bell" /></button>
        <button aria-label="Pengaturan" className="grid size-12 place-items-center rounded-[14px] hover:bg-white/10"><Icon name="gear" /></button>
      </nav>
      <div className="flex w-12 flex-col items-center gap-3 border-t border-white/10 pt-4">
        <button aria-label="Profil NS" className="size-12 rounded-full border-2 border-white/30 bg-white/20 text-sm text-white">NS</button>
        <button aria-label="Keluar" className="grid size-10 place-items-center rounded-[10px]"><Icon name="door" size={16} /></button>
      </div>
    </aside>

    <div className="ml-20 min-h-screen lg:h-screen">
      <header className="mr-4 flex h-[105px] items-center justify-between border-b border-slate-100 bg-white px-8">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-normal leading-8"><Icon name="sun" className="text-orange-500" />Selamat Pagi, Perawat Sarah</h1>
          <p className="ml-[34px] mt-1 text-sm text-slate-500">Shift Pagi</p>
        </div>
        {view === "patients" && <div className="flex h-9 items-center gap-2 rounded-full bg-emerald-50 px-4 text-sm text-emerald-700"><i className="size-2 rounded-full bg-emerald-500" />Shift Aktif</div>}
      </header>

      {view === "home" ? <DashboardHome onOpenPatient={openPatient} /> : <div className="py-8 pr-12 pl-8 lg:h-[calc(100vh-105px)] lg:overflow-hidden">
        <h2 className="mb-6 text-2xl font-normal leading-8">Daftar Semua Pasien</h2>
        <div className="grid gap-6 lg:h-[calc(100%-56px)] lg:grid-cols-2 lg:overflow-hidden">
          <section className="flex min-h-[530px] flex-col overflow-hidden rounded-[14px] border border-gray-200 bg-white">
            <header className="h-[81px] shrink-0 border-b border-gray-200 px-4 pt-4">
              <h3 className="text-lg font-normal tracking-[-.36px]">Daftar Pasien</h3>
              <p className="mt-1 text-xs text-slate-500">{rosterPatients.length} pasien • Diurutkan berdasarkan risiko</p>
            </header>
            <div className="flex flex-col gap-2 overflow-y-auto p-4">
              {rosterPatients.length === 0 ? <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-400"><Icon name="users" size={24} /></div>
                  <p className="mt-4 text-sm text-slate-600">Belum ada pasien</p>
                  <p className="mt-1 text-xs text-slate-400">Data pasien akan muncul di sini.</p>
                </div>
              </div> : rosterPatients.map((patient) => <PatientRow key={patient.name} patient={patient} selected={selectedName === patient.name} onSelect={() => setSelectedName(patient.name)} />)}
            </div>
          </section>

          <section className="overflow-y-auto rounded-[14px] border border-gray-200 bg-white">
            {rosterPatients.length === 0 ? <div className="grid min-h-[530px] place-items-center px-6 text-center">
              <div>
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-blue-300"><Icon name="trend" size={24} /></div>
                <p className="mt-4 text-sm text-slate-600">Belum ada grafik pemantauan</p>
                <p className="mt-1 text-xs text-slate-400">Pilih pasien setelah data tersedia untuk melihat grafik.</p>
              </div>
            </div> : <><header className="border-b border-gray-200 bg-blue-50/70 px-6 py-6">
              <div className="flex items-start justify-between">
                <div><h3 className="text-xl font-normal leading-7">{selected.name}</h3><p className="mt-1 text-sm text-slate-500">{selected.location}</p></div>
                <CareBadge type={selected.type} large />
              </div>
              <div className="mt-5 flex min-h-[53px] items-center gap-3 rounded-xl border-l-4 border-rose-500 bg-rose-50 px-3 text-rose-700">
                <Icon name="alert" size={20} />
                <div><p className="text-sm">Status Kritis - Tindakan Segera Diperlukan</p><p className="text-xs">Monitoring ketat direkomendasikan</p></div>
              </div>
            </header>
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-3 gap-4">
                <MetricCard icon="pulse" label="Risiko Kebocoran" value={selected.risk ?? 35} color="rose" />
                <MetricCard icon="drop" label="Level Kantong" value={selected.level} color="blue" />
                <MetricCard icon="heart" label="Integritas Kulit" value={selected.skin} color="purple" />
              </div>
              <MonitoringCard title="Kelembaban Sensor" subtitle="Monitoring 24 jam terakhir" kind="moisture" />
              <MonitoringCard title="Resistansi Kulit" subtitle="Indikator integritas kulit" kind="resistance" />
              <section className="rounded-[14px] border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-sm font-normal">Catatan Klinis</h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-500">
                  {["Sensor terpasang sejak 3 hari yang lalu", "Terakhir diperiksa: 2 jam yang lalu", "Kantong terakhir diganti: 4 jam yang lalu"].map((note) => <li key={note} className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-blue-500" />{note}</li>)}
                </ul>
              </section>
            </div></>}
          </section>
        </div>
      </div>}
    </div>
  </main>;
}
