// Rangkaian LIG resistif (konfirmasi tim): 3,3 V → LIG → pin ADC → 10 kΩ → GND.
// R_LIG = 10 kΩ × (4095 − ADC) / ADC.
// ponytail: perkiraan kasar — analogRead mentah ESP32 tidak linear, terutama di
// bawah ±100 mV (ADC kecil). Untuk akurasi: firmware pakai analogReadMilliVolts.
export const LIG_R_FIXED_OHM = 10_000;
const ADC_MAX = 4095;

/** Hambatan LIG (Ω). Infinity = terbuka/kering (ADC 0). null = tidak ada data. */
export function ligOhm(adc: number | null | undefined): number | null {
  if (adc == null || !Number.isFinite(adc)) return null;
  if (adc <= 0) return Infinity;
  if (adc >= ADC_MAX) return 0;
  return (LIG_R_FIXED_OHM * (ADC_MAX - adc)) / adc;
}

export function formatOhm(ohm: number | null): string {
  if (ohm == null) return "—";
  if (!Number.isFinite(ohm)) return "terbuka (> 40 MΩ)";
  if (ohm >= 1e6) return `${(ohm / 1e6).toFixed(1)} MΩ`;
  if (ohm >= 1e3) return `${Math.round(ohm / 1e3)} kΩ`;
  return `${Math.round(ohm)} Ω`;
}
