"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getPatientNameBySessionId } from "@/lib/patient";

type UrgentEvent = {
  id: string;
  patientName: string;
  riskClass: "Urgent" | "Caution";
};

type UrgentAlertContextValue = {
  unreadCount: number;
  clearUnread: () => void;
};

const UrgentAlertContext = createContext<UrgentAlertContextValue>({ unreadCount: 0, clearUnread: () => {} });

export const useUrgentAlerts = () => useContext(UrgentAlertContext);

// Bukan Notification API bawaan browser (butuh izin, hilang kalau tab ditutup) —
// ini toast in-app + nada yang jelas beda urgensinya, sinkron dengan status AI
// (lihat lib/ai-prediction.ts, kontrak integrasi v0.2).
function playAlertTone(urgent: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const beep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    if (urgent) {
      beep(880, 0, 0.15);
      beep(1108, 0.18, 0.18); // dua nada naik — lebih genting
    } else {
      beep(660, 0, 0.18);
    }
    setTimeout(() => ctx.close(), 600);
  } catch {
    // Audio gagal (autoplay policy dll) — toast visual tetap muncul, gak fatal.
  }
}

export function UrgentAlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<UrgentEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const channel = supabase
      .channel("urgent-ai-predictions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_predictions" },
        (payload) => {
          const row = payload.new as {
            session_id: string;
            risk_class: string | null;
            received_at: string;
            prediction_available: boolean;
          };
          if (!row.prediction_available || (row.risk_class !== "Urgent" && row.risk_class !== "Caution")) return;

          const id = `${row.session_id}-${row.received_at}`;
          if (seen.current.has(id)) return; // dedupe kalau event kekirim dobel
          seen.current.add(id);

          const event: UrgentEvent = {
            id,
            patientName: getPatientNameBySessionId(row.session_id) ?? row.session_id,
            riskClass: row.risk_class as "Urgent" | "Caution",
          };
          setToasts((prev) => [...prev, event]);
          setUnreadCount((prev) => prev + 1);
          playAlertTone(event.riskClass === "Urgent");
          setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 10000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const clearUnread = () => setUnreadCount(0);

  return (
    <UrgentAlertContext.Provider value={{ unreadCount, clearUnread }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const critical = t.riskClass === "Urgent";
          return (
            <div
              key={t.id}
              role="alert"
              className={`flex items-start gap-3 rounded-[12px] border p-4 shadow-lg ${
                critical ? "border-rose-300 bg-rose-50" : "border-amber-300 bg-amber-50"
              }`}
            >
              {critical ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-semibold ${critical ? "text-rose-800" : "text-amber-800"}`}>
                  {critical ? "Risiko Kritis" : "Perlu Perhatian"} — {t.patientName}
                </p>
                <p className={`mt-0.5 text-xs ${critical ? "text-rose-700/80" : "text-amber-700/80"}`}>
                  Klasifikasi AI: {t.riskClass}
                </p>
              </div>
              <button
                aria-label="Tutup"
                onClick={() => dismiss(t.id)}
                className={`shrink-0 rounded-full p-1 hover:bg-black/5 ${critical ? "text-rose-500" : "text-amber-500"}`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </UrgentAlertContext.Provider>
  );
}
