import { supabase } from "@/lib/supabase";
import type { Calibration } from "@/lib/calibration";

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

// Level kantong dari bacaan kapasitif mentah — satu-satunya tempat yang boleh
// menerjemahkan capacitance_raw jadi persen (roster, workspace, modal detail
// semuanya lewat sini, bukan masing-masing hitung sendiri).
export function volumePct(capacitanceRaw: number, calibration: Calibration): number {
  return clamp(((capacitanceRaw - calibration.cap_empty) / (calibration.cap_full - calibration.cap_empty)) * 100);
}

export type VolumeReading = { value: number; updatedAt: string };

// Satu query buat banyak pasien sekaligus (roster), bukan N+1 per baris — sama
// pola dengan fetchLatestPredictionsForSessions di lib/ai-prediction.ts.
// updatedAt ikut dibawa supaya UI bisa nunjukin freshness data ke nakes
// (bedanya "42% baru saja" vs "42% dari 3 jam lalu" itu penting secara klinis).
export async function fetchLatestVolumeForSessions(
  sessionIds: string[],
  calibration: Calibration,
): Promise<Record<string, VolumeReading>> {
  const uniqueIds = [...new Set(sessionIds)];
  if (uniqueIds.length === 0) return {};

  const { data } = await supabase
    .from("sensor_logs")
    .select("session_id, capacitance_raw, timestamp")
    .in("session_id", uniqueIds)
    .order("timestamp", { ascending: false });

  const result: Record<string, VolumeReading> = {};
  for (const row of data ?? []) {
    if (result[row.session_id] === undefined && row.capacitance_raw != null) {
      // baris pertama per sesi = terbaru (sudah di-order)
      result[row.session_id] = { value: volumePct(row.capacitance_raw, calibration), updatedAt: row.timestamp };
    }
  }
  return result;
}

// "5 menit lalu" dst — dipakai di roster & detail biar nakes langsung tahu data
// segar atau basi tanpa harus mikir konversi timestamp sendiri.
export function formatFreshness(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return "Belum ada data";
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}
