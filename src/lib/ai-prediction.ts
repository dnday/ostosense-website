import { supabase } from "@/lib/supabase";

// Kontrak: OSTOSENSE-AI/docs/ai-software-integration-contract-v0.2.md
// Satu-satunya tempat yang boleh menerjemahkan baris `ai_predictions` jadi label/tier UI.

export type RiskClass = "Safe" | "Monitor" | "Caution" | "Urgent";
export type PredictionTier = "urgent" | "warning" | "normal" | "unknown";

export type AiPredictionRow = {
  session_id: string;
  received_at: string;
  model_status: "UNAVAILABLE" | "TEST_ONLY" | "UNVALIDATED";
  prediction_available: boolean;
  risk_class: RiskClass | null;
};

export type AiPredictionInfo = {
  label: string;
  riskClass: RiskClass | null;
  tier: PredictionTier;
};

const TIER_BY_CLASS: Record<RiskClass, PredictionTier> = {
  Safe: "normal",
  Monitor: "normal",
  Caution: "warning",
  Urgent: "urgent",
};

const PREDICTION_COLUMNS = "session_id, received_at, model_status, prediction_available, risk_class";

// Kelas AI cuma boleh ditampilkan lewat tiga label ini (persis, jangan diubah jadi
// persentase/countdown) — lihat tabel "Tiga keadaan yang sah" di kontrak integrasi.
export function formatPrediction(row: AiPredictionRow | null): AiPredictionInfo {
  if (!row || !row.prediction_available || !row.risk_class) {
    return { label: "AI belum tersedia", riskClass: null, tier: "unknown" };
  }
  if (row.model_status === "TEST_ONLY") {
    return { label: `Simulasi AI: ${row.risk_class}`, riskClass: row.risk_class, tier: TIER_BY_CLASS[row.risk_class] };
  }
  if (row.model_status === "UNVALIDATED") {
    return { label: `AI Eksperimental: ${row.risk_class}`, riskClass: row.risk_class, tier: TIER_BY_CLASS[row.risk_class] };
  }
  return { label: "AI belum tersedia", riskClass: null, tier: "unknown" };
}

export async function fetchLatestPrediction(sessionId: string): Promise<AiPredictionRow | null> {
  const { data } = await supabase
    .from("ai_predictions")
    .select(PREDICTION_COLUMNS)
    .eq("session_id", sessionId)
    .order("received_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as AiPredictionRow | null) ?? null;
}

// Satu query buat banyak pasien sekaligus (roster/summary), bukan N+1 per baris.
export async function fetchLatestPredictionsForSessions(
  sessionIds: string[],
): Promise<Record<string, AiPredictionRow>> {
  const uniqueIds = [...new Set(sessionIds)];
  if (uniqueIds.length === 0) return {};

  const { data } = await supabase
    .from("ai_predictions")
    .select(PREDICTION_COLUMNS)
    .in("session_id", uniqueIds)
    .order("received_at", { ascending: false });

  const result: Record<string, AiPredictionRow> = {};
  for (const row of (data as AiPredictionRow[] | null) ?? []) {
    if (!result[row.session_id]) result[row.session_id] = row; // baris pertama per sesi = terbaru (sudah di-order)
  }
  return result;
}
