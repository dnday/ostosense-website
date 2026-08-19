import { Icon } from "@/components/ui/icon";
import { Chart } from "@/components/ui/chart";

export function MonitoringCard({
  title,
  subtitle,
  kind,
  data = [],
}: {
  title: string;
  subtitle: string;
  kind: "moisture" | "resistance";
  data?: any[];
}) {
  const moisture = kind === "moisture";

  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5 overflow-hidden min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-normal text-slate-900">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <span
          className={`inline-flex h-7 items-center gap-2 rounded-[10px] px-3 text-xs ${moisture ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-700"}`}
        >
          <Icon name={moisture ? "trend" : "pulse"} size={16} />
          {moisture ? "Monitoring Aktif" : "LIG Aktif"}
        </span>
      </div>
      <Chart kind={kind} data={data} />
    </section>
  );
}
