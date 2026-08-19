import { Activity, Droplets, Heart } from "lucide-react";

export function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: "pulse" | "drop" | "heart" | string;
  label: string;
  value: number;
  color: "rose" | "amber" | "blue" | "purple";
}) {
  const iconProps = { size: 16, strokeWidth: 1.5 };
  
  const iconMap: Record<string, JSX.Element> = {
    pulse: <Activity {...iconProps} />,
    drop: <Droplets {...iconProps} />,
    heart: <Heart {...iconProps} />,
  };

  const colorStyles = {
    rose: "text-rose-500 [&_.bar]:bg-rose-500",
    amber: "text-amber-500 [&_.bar]:bg-amber-500",
    blue: "text-blue-500 [&_.bar]:bg-blue-500",
    purple: "text-purple-500 [&_.bar]:bg-purple-500",
  };

  return (
    <div className={`h-[104px] rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm ${colorStyles[color]}`}>
      <div className="flex items-center gap-2">
        {iconMap[icon] || <Activity {...iconProps} />}
        <span className="text-[13px] font-medium leading-4 text-slate-500">{label}</span>
      </div>
      <strong className="mt-2.5 block text-2xl font-semibold tracking-tight text-slate-900">
        {value}%
      </strong>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-100">
        <i
          className="bar block h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
