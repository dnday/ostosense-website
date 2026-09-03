import type { Patient } from "@/types/patient";

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

export function isUrgentPatient(patient: Patient) {
  return (patient.risk ?? 0) >= 80;
}

export function isWarningPatient(patient: Patient) {
  const risk = patient.risk ?? 0;
  return risk >= 50 && risk < 80;
}

export function getPatientToneClasses(patient: Patient) {
  if (isUrgentPatient(patient)) {
    return {
      tone: "border-rose-300 bg-rose-50/50",
      accent: "text-rose-600",
    };
  }

  if (isWarningPatient(patient)) {
    return {
      tone: "border-amber-300 bg-amber-50/50",
      accent: "text-amber-600",
    };
  }

  return {
    tone: "border-slate-200 bg-white",
    accent: "text-emerald-500",
  };
}

export function getPatientRiskBadgeClasses(patient: Patient) {
  return isUrgentPatient(patient)
    ? "bg-rose-100 text-rose-600"
    : "bg-emerald-100 text-emerald-700";
}

export function getPatientLevelBarClass(patient: Patient) {
  return isUrgentPatient(patient) ? "bg-orange-400" : "bg-[#1d2f4a]";
}

export function getPatientDetailCardBorderClass(patient: Patient) {
  return isUrgentPatient(patient) ? "border-rose-400" : "border-slate-200";
}
