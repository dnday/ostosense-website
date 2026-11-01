import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export type ChartKind = "moisture" | "resistance" | "baseplate";

// Semua nilai MENTAH dari ESP32-S3: kapasitif = hitungan touchRead (bukan pF),
// LIG = hitungan ADC 12-bit 0–4095 (bukan kΩ). Nama seri muncul di tooltip.
const SERIES: Record<ChartKind, { key: string; name: string; color: string }[]> = {
  moisture: [{ key: "capacitance_raw", name: "Kap_7 (hitungan touch)", color: "#008bd2" }],
  resistance: [
    { key: "res_15_raw", name: "Res_15 dalam (ADC 0–4095)", color: "#a23bf0" },
    { key: "res_16_raw", name: "Res_16 luar (ADC 0–4095)", color: "#e11d48" },
    // data lama/demo hanya punya rata-rata lig_raw, tanpa per kanal
    { key: "lig_legacy", name: "LIG gabungan, data lama (ADC 0–4095)", color: "#64748b" },
  ],
  baseplate: [
    { key: "kap_4_raw", name: "Kap_4 dalam (hitungan touch)", color: "#0d9488" },
    { key: "kap_5_raw", name: "Kap_5 luar (hitungan touch)", color: "#f59e0b" },
  ],
};

export function Chart({ kind, data = [] }: { kind: ChartKind; data?: any[] }) {
  const series = SERIES[kind];

  // Format data for Recharts
  const chartData = data.map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ...Object.fromEntries(series.map((s) => [s.key, log[s.key]])),
    lig_legacy: log.res_15_raw == null ? log.lig_raw : undefined,
  }));

  // Jika data kosong, tampilkan placeholder agar tidak rusak
  if (chartData.length === 0) {
    return (
      <div className="mt-2 flex h-[180px] w-full items-center justify-center text-sm text-slate-400">
        Menunggu data real-time...
      </div>
    );
  }

  return (
    <div className="mt-2 h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: "#64748b" }} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: "#64748b" }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#64748b', fontSize: '12px' }}
            itemStyle={{ fontSize: '14px', fontWeight: 600 }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false} // Matikan animasi awal agar pergerakan real-time terlihat mulus
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
