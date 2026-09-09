import { supabase } from "@/lib/supabase";

export type Calibration = {
  cap_empty: number;
  cap_full: number;
  humid_high: number;
};

// Diturunkan dari data kalibrasi asli (P001-P007 + sesi OSTOSENSE_*), lihat
// /home/marcel/Downloads/Kalibrasi-*/Kalibrasi. cap_empty/cap_full dari median
// Kap_7 kondisi kering (P001) vs kantong penuh (P007, dipangkas dari noise).
export const DEFAULT_CALIBRATION: Calibration = {
  cap_empty: 30000,
  cap_full: 250000,
  humid_high: 60,
};

export async function fetchCalibration(): Promise<Calibration> {
  const { data } = await supabase.from("sensor_calibration").select("*").eq("id", "default").maybeSingle();
  return data ? { ...DEFAULT_CALIBRATION, ...data } : DEFAULT_CALIBRATION;
}

export async function saveCalibration(values: Calibration) {
  return supabase.from("sensor_calibration").upsert({ id: "default", ...values, updated_at: new Date().toISOString() });
}
