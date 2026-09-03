import type { PredictionTier } from "@/lib/ai-prediction";

// ponytail: `patients` belum punya kolom session_id/device_id sungguhan (satu ESP32
// fisik + beberapa sesi demo di-map manual di sini). Pindah ke kolom DB kalau device
// fisik sudah lebih dari satu.
const PATIENT_SESSION_IDS: Record<string, string> = {
  "Pasien Uji Coba": "ESP32_ASLI_01", // device fisik asli
  "John Martinez": "DEMO_JOHN_MARTINEZ",
  "Emily Johnson": "DEMO_EMILY_JOHNSON",
  "Michael Chen": "DEMO_MICHAEL_CHEN",
  "Sarah Williams": "DEMO_SARAH_WILLIAMS",
};

export function getPatientSessionId(patientName: string): string | null {
  return PATIENT_SESSION_IDS[patientName] ?? null;
}

// Urgensi tampilan sekarang bersumber dari kelas AI (lihat src/lib/ai-prediction.ts),
// bukan dari ambang numerik Patient.risk — lihat OSTOSENSE-AI/docs/
// ai-software-integration-contract-v0.2.md, MUST FIX #1 dashboard.
export function getToneClassesForTier(tier: PredictionTier) {
  if (tier === "urgent") {
    return { tone: "border-rose-300 bg-rose-50/50", accent: "text-rose-600" };
  }
  if (tier === "warning") {
    return { tone: "border-amber-300 bg-amber-50/50", accent: "text-amber-600" };
  }
  if (tier === "normal") {
    return { tone: "border-slate-200 bg-white", accent: "text-emerald-500" };
  }
  // unknown: belum ada prediksi AI sama sekali — bukan "aman", beda status.
  return { tone: "border-slate-200 bg-white", accent: "text-slate-400" };
}
