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
      className={`h-[74px] w-full shrink-0 rounded-[10px] border text-left transition hover:brightness-[.99] ${tone} ${selected ? "shadow-[inset_0_0_0_1px_rgba(244,63,94,0.18)]" : ""}`}
    >
      <span className="flex h-full items-start justify-between px-4 py-4">
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <i
              className={`size-2 shrink-0 rounded-full bg-current ${accent}`}
            />
            <span className="truncate text-sm tracking-[-.28px] text-slate-900">
              {patient.name}
            </span>
            <CareBadge type={patient.type} />
          </span>
          <span className="mt-1 block pl-4 text-xs text-slate-500">
            {patient.location}
          </span>
        </span>
        {patient.risk && (
          <span className={`flex items-center gap-1 text-xs ${accent}`}>
            <Icon name="alert" size={16} />
            {patient.risk}%
          </span>
        )}
      </span>
    </button>
  );
}
