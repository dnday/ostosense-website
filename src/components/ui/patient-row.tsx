import { CareBadge } from "@/components/ui/care-badge";
import { Icon } from "@/components/ui/icon";
import { getPatientToneClasses } from "@/lib/patient";
import type { Patient } from "@/types/patient";

export function PatientRow({
  patient,
  selected,
  onSelect,
}: {
  patient: Patient;
  selected: boolean;
  onSelect: () => void;
}) {
  const { tone, accent } = getPatientToneClasses(patient);

  return (
    <button
      aria-pressed={selected}
      onClick={onSelect}
      className={`h-[74px] w-full shrink-0 rounded-[10px] border text-left transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 ${tone} ${selected ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.3)] ring-1 ring-slate-300" : ""}`}
    >
      <span className="flex h-full items-start justify-between px-4 py-4">
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <i
              className={`size-2 shrink-0 rounded-full bg-current ${accent}`}
            />
            <span className="truncate text-[15px] font-medium tracking-tight text-slate-900">
              {patient.name}
            </span>
            <CareBadge type={patient.type} />
          </span>
          <span className="mt-1.5 block pl-4 text-xs font-medium text-slate-500">
            {patient.location}
          </span>
        </span>
        {patient.risk && (
          <span className={`flex items-center gap-1.5 text-sm font-medium ${accent}`}>
            <Icon name="alert" size={16} />
            {patient.risk}%
          </span>
        )}
      </span>
    </button>
  );
}
