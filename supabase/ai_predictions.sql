-- Jalankan sekali di Supabase Dashboard -> SQL Editor (project jmjxhtksvsfpczpdwfqa).
-- Menyimpan setiap payload keluaran AI (kontrak ai-runtime-output-v0.2) yang diterima
-- backend, sebagai catatan yang bisa diaudit. Lihat OSTOSENSE-AI/docs/ai-software-
-- integration-contract-v0.2.md untuk arti tiap field.

create table if not exists public.ai_predictions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  session_id text not null,
  received_at timestamptz not null default now(),
  runtime_output_version text not null,
  mode text not null,
  data_source text not null,
  model_status text not null,
  prediction_available boolean not null,
  risk_class text,
  risk_class_index int,
  source_window_end_ms int,
  model_input_channel text,
  model_artifact_version text,
  model_artifact_sha256 text,
  evidence_scope text not null,
  warning text not null
);

create index if not exists ai_predictions_session_idx
  on public.ai_predictions (session_id, received_at desc);
