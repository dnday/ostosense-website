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
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5 overflow-hidden min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-normal text-slate-900">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
      <Chart kind={kind} data={data} />
    </section>
  );
}
