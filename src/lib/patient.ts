import type { Patient } from "@/types/patient";

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
