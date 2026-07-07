import { Icon, type IconName } from "@/components/ui/icon";

export function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: IconName;
  label: string;
  value: number;
  color: "rose" | "blue" | "purple";
}) {
  const themes = {
    rose: "border-rose-200 bg-rose-50 text-rose-500 [&_.bar]:bg-rose-500",
    blue: "border-blue-200 bg-blue-50 text-blue-600 [&_.bar]:bg-blue-500",
    purple:
      "border-purple-200 bg-purple-50 text-purple-600 [&_.bar]:bg-purple-500",
  };

  return (
    <div className={`h-[104px] rounded-[14px] border p-3 ${themes[color]}`}>
      <div className="flex items-center gap-2">
        <Icon name={icon} size={16} />
        <span className="text-xs leading-4 text-slate-500">{label}</span>
      </div>
      <strong className="mt-2 block text-2xl font-normal text-slate-900">
        {value}%
      </strong>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
        <i
          className="bar block h-full rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
