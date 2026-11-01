import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ligOhm, formatOhm } from "@/lib/lig";

export type ChartKind = "moisture" | "resistance" | "baseplate";

// Semua nilai MENTAH dari ESP32-S3: kapasitif = hitungan touchRead (bukan pF),
// LIG = ADC 12-bit 0–4095, dikonversi ke perkiraan hambatan (lib/lig.ts). Nama seri muncul di tooltip.
const SERIES: Record<ChartKind, { key: string; name: string; color: string }[]> = {
  moisture: [{ key: "capacitance_raw", name: "Kap_7 naik dari awal", color: "#008bd2" }],
  resistance: [
    { key: "res_15_raw", name: "Res_15 dalam (perkiraan)", color: "#a23bf0" },
    { key: "res_16_raw", name: "Res_16 luar (perkiraan)", color: "#e11d48" },
    // data lama/demo hanya punya rata-rata lig_raw, tanpa per kanal
    { key: "lig_legacy", name: "LIG gabungan, data lama (perkiraan)", color: "#64748b" },
  ],
  baseplate: [
    { key: "kap_4_raw", name: "Kap_4 dalam, naik dari awal", color: "#0d9488" },
    { key: "kap_5_raw", name: "Kap_5 luar, naik dari awal", color: "#f59e0b" },
  ],
};

function median(xs: number[]): number | undefined {
  if (xs.length === 0) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function Chart({ kind, data = [] }: { kind: ChartKind; data?: any[] }) {
  const series = SERIES[kind];
  // Hitungan touchRead tidak bisa diubah ke pF tanpa kalibrasi, jadi kapasitif
  // ditampilkan sebagai % naik dari awal rentang grafik (sama dengan cara AI:
  // selisih dari kondisi awal). LIG tetap ADC mentah.
  const relative = kind !== "resistance";
  const baseline = Object.fromEntries(
    series.map((s) => [s.key, median(data.map((l) => l[s.key]).filter(Number.isFinite).slice(0, 10))]),
  );

  // Format data for Recharts
  const chartData = data.map((log) => {
    const row: Record<string, unknown> = {
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      lig_legacy: log.res_15_raw == null ? log.lig_raw : undefined,
    };
    for (const s of series) {
      const v = (log[s.key] ?? row[s.key]) as number; // lig_legacy sudah diisi di atas
      const b = baseline[s.key];
      if (relative) {
        row[s.key] = Number.isFinite(v) && b ? Math.round(((v - b) / b) * 1000) / 10 : v;
      } else {
        // kΩ untuk sumbu log; terbuka (Infinity) / 0 Ω tidak bisa digambar -> celah
        const ohm = ligOhm(v);
        row[s.key] = ohm != null && Number.isFinite(ohm) && ohm > 0 ? ohm / 1000 : null;
      }
      row[`${s.key}__mentah`] = v;
    }
    return row;
  });

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
            scale={relative ? "auto" : "log"}
            allowDataOverflow={false}
            tick={{ fontSize: 10, fill: "#64748b" }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={relative ? (v) => `${v}%` : (v) => formatOhm(v * 1000)}
          />
          <Tooltip
            formatter={(value, _name, item) =>
              relative
                ? `${value}% (mentah ${item.payload[`${item.dataKey}__mentah`]})`
                : `${formatOhm(ligOhm(item.payload[`${item.dataKey}__mentah`]))} (ADC ${item.payload[`${item.dataKey}__mentah`]})`
            }
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
              connectNulls={relative}
              isAnimationActive={false} // Matikan animasi awal agar pergerakan real-time terlihat mulus
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
