import { Building, Home } from "lucide-react";
import type { PatientType } from "@/types/patient";

/* Ikon sama dengan tab filter di dashboard-home (Building/Home) agar konsisten. */
export function CareBadge({
  type,
  large = false,
}: {
  type: PatientType;
  large?: boolean;
}) {
  const inap = type === "inap";
  const BadgeIcon = inap ? Building : Home;
  return (
    <span
      className={`inline-flex shrink-0 items-center font-medium rounded-md ring-1 ring-inset ${
        large ? "h-9 gap-1.5 px-3 text-sm" : "h-5 gap-1 px-2 text-xs"
      } ${
        inap
          ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
          : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      }`}
    >
      <BadgeIcon size={large ? 16 : 12} strokeWidth={2} />
      {inap ? "Rawat Inap" : "Rawat Jalan"}
    </span>
  );
}
