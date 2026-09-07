import { supabase } from "@/lib/supabase";

export type Calibration = {
  cap_empty: number;
  cap_full: number;
  lig_base: number;
  lig_dead: number;
  humid_high: number;
};

// Diturunkan dari data kalibrasi asli (P001-P007 + sesi OSTOSENSE_*), lihat
// /home/marcel/Downloads/Kalibrasi-*/Kalibrasi. cap_empty/cap_full dari median
// Kap_7 kondisi kering (P001) vs kantong penuh (P007, dipangkas dari noise).
// lig_base/lig_dead dari rata-rata Res_15+Res_16: kontak cairan bikin nilai
// NAIK (kebalik dari asumsi simulator lama), jadi lig_base < lig_dead di sini.
export const DEFAULT_CALIBRATION: Calibration = {
  cap_empty: 30000,
  cap_full: 250000,
  lig_base: 10,
  lig_dead: 1470,
  humid_high: 60,
};

export async function fetchCalibration(): Promise<Calibration> {
  const { data } = await supabase.from("sensor_calibration").select("*").eq("id", "default").maybeSingle();
  return data ? { ...DEFAULT_CALIBRATION, ...data } : DEFAULT_CALIBRATION;
}

export async function saveCalibration(values: Calibration) {
  return supabase.from("sensor_calibration").upsert({ id: "default", ...values, updated_at: new Date().toISOString() });
}

// Satu query buat banyak pasien sekaligus (dipakai di kartu roster), bukan N+1 per baris.
// Ambil bacaan lig_raw TERAKHIR per session_id — bukan rata-rata, biar konsisten
// dengan "current" di tempat lain (mobile app, detail modal pakai rata-rata 20 log).
export async function fetchLatestLigForSessions(sessionIds: string[]): Promise<Record<string, number>> {
  const uniqueIds = [...new Set(sessionIds)];
  if (uniqueIds.length === 0) return {};

  const { data } = await supabase
    .from("sensor_logs")
    .select("session_id, lig_raw, timestamp")
    .in("session_id", uniqueIds)
    .order("timestamp", { ascending: false });

  const result: Record<string, number> = {};
  for (const row of (data as { session_id: string; lig_raw: number }[] | null) ?? []) {
    if (!(row.session_id in result)) result[row.session_id] = row.lig_raw; // baris pertama per sesi = terbaru
  }
  return result;
}
