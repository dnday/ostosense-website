import { supabase } from "@/lib/supabase";

export type Calibration = {
  cap_empty: number;
  cap_full: number;
  lig_base: number;
  lig_dead: number;
  humid_high: number;
};

export const DEFAULT_CALIBRATION: Calibration = {
  cap_empty: 1000,
  cap_full: 1600,
  lig_base: 1800,
  lig_dead: 1200,
  humid_high: 60,
};

export async function fetchCalibration(): Promise<Calibration> {
  const { data } = await supabase.from("sensor_calibration").select("*").eq("id", "default").maybeSingle();
  return data ? { ...DEFAULT_CALIBRATION, ...data } : DEFAULT_CALIBRATION;
}

export async function saveCalibration(values: Calibration) {
  return supabase.from("sensor_calibration").upsert({ id: "default", ...values, updated_at: new Date().toISOString() });
}
