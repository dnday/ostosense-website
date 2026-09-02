"use client";

import { useEffect, useState } from "react";
import { Settings, User, Bell, Check } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { supabase } from "@/lib/supabase";

const NOTIF_STORAGE_KEY = "nakes-notif-prefs";

type NotifPrefs = { pasienKritis: boolean; ringkasanHarian: boolean };
const DEFAULT_PREFS: NotifPrefs = { pasienKritis: true, ringkasanHarian: true };

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#283953]" : "bg-slate-200"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setName(data.user?.user_metadata?.full_name ?? "");
      setEmail(data.user?.email ?? "");
    });
    const raw = typeof window !== "undefined" ? localStorage.getItem(NOTIF_STORAGE_KEY) : null;
    if (raw) setPrefs(JSON.parse(raw));
  }, []);

  const togglePref = (key: keyof NotifPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(next));
  };

  const saveProfile = async () => {
    if (!name.trim()) return setError("Nama gak boleh kosong");
    setError("");
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSaving(false);
    if (updateError) return setError(updateError.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1d2f4a]">Setelan</h1>
            <p className="mt-1 text-sm text-slate-500">Kelola profil dan preferensi notifikasi</p>
          </div>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Profil</h2>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nama lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{email}</p>
          </div>

          {!!error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex h-10 w-fit items-center gap-2 rounded-lg bg-[#283953] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1D2F4A] disabled:opacity-60"
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            {saving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan Perubahan"}
          </button>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Notifikasi</h2>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Peringatan pasien kritis</p>
              <p className="text-xs text-slate-500">Diingatkan saat ada pasien berstatus risiko tinggi</p>
            </div>
            <Toggle checked={prefs.pasienKritis} onChange={() => togglePref("pasienKritis")} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Ringkasan harian</p>
              <p className="text-xs text-slate-500">Ringkasan kondisi seluruh pasien setiap hari</p>
            </div>
            <Toggle checked={prefs.ringkasanHarian} onChange={() => togglePref("ringkasanHarian")} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
