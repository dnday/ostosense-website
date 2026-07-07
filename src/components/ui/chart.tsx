import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function Chart({ kind, data = [] }: { kind: "moisture" | "resistance"; data?: any[] }) {
  const isMoisture = kind === "moisture";
  const dataKey = isMoisture ? "capacitance_raw" : "lig_raw";
  const color = isMoisture ? "#008bd2" : "#a23bf0";

  // Format data for Recharts
  const chartData = data.map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: log[dataKey],
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
            itemStyle={{ color: color, fontSize: '14px', fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false} // Matikan animasi awal agar pergerakan real-time terlihat mulus
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
