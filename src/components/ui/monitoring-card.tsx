"use client";

import { useEffect, useState } from "react";
import { Chart, type ChartKind } from "@/components/ui/chart";

const LIVE_WINDOW_MS = 10 * 60 * 1000;

export function MonitoringCard({
  title,
  subtitle,
  kind,
  data = [],
}: {
  title: string;
  subtitle: string;
  kind: ChartKind;
  data?: any[];
}) {
  // "Live" hanya kalau data terakhir < 10 menit (sama dengan status koneksi di halaman pasien)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const last = data[data.length - 1];
  const isLive = !!last && now - new Date(last.timestamp).getTime() < LIVE_WINDOW_MS;
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5 overflow-hidden min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-normal text-slate-900">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-300" />
            Tidak terhubung
          </span>
        )}
      </div>
      <Chart kind={kind} data={data} />
    </section>
  );
}
