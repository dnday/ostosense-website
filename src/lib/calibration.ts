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

const LIG_SMOOTH_WINDOW = 5;

// Satu query buat banyak pasien sekaligus (dipakai di kartu roster), bukan N+1 per baris.
// lig_raw sample-per-sample sangat berisik (data pilot: lompat 1 -> 1194 -> 3 antar
// sample berturut-turut) — rata-ratakan LIG_SMOOTH_WINDOW bacaan terakhir per
// session_id, konsisten dengan "current" di tempat lain (mobile app, detail modal).
export async function fetchLatestLigForSessions(sessionIds: string[]): Promise<Record<string, number>> {
  const uniqueIds = [...new Set(sessionIds)];
  if (uniqueIds.length === 0) return {};

  const { data } = await supabase
    .from("sensor_logs")
    .select("session_id, lig_raw, timestamp")
    .in("session_id", uniqueIds)
    .order("timestamp", { ascending: false })
    .limit(uniqueIds.length * LIG_SMOOTH_WINDOW * 4); // buffer, urutan campur antar sesi

  const bySession = new Map<string, number[]>();
  for (const row of (data as { session_id: string; lig_raw: number }[] | null) ?? []) {
    const bucket = bySession.get(row.session_id) ?? [];
    if (bucket.length < LIG_SMOOTH_WINDOW) {
      bucket.push(row.lig_raw); // baris terdepan per sesi = paling baru (query di-sort desc)
      bySession.set(row.session_id, bucket);
    }
  }

  const result: Record<string, number> = {};
  for (const [sessionId, values] of bySession) {
    result[sessionId] = values.reduce((sum, v) => sum + v, 0) / values.length;
  }
  return result;
}
