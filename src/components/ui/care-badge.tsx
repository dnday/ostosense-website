import { Icon } from "@/components/ui/icon";
import type { PatientType } from "@/types/patient";

export function CareBadge({
  type,
  large = false,
}: {
  type: PatientType;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded ${large ? "h-9 px-3 text-sm" : "h-5 px-2 text-xs"} ${type === "inap" ? "bg-purple-50 text-purple-600" : large ? "bg-blue-100 text-blue-600" : "bg-blue-50 text-slate-700"}`}
    >
      <Icon name={type === "inap" ? "bed" : "home"} size={large ? 16 : 12} />
      {type === "inap" ? "Rawat Inap" : "Rawat Jalan"}
    </span>
  );
}
