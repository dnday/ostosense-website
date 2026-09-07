-- Jalankan sekali di Supabase Dashboard -> SQL Editor (project jmjxhtksvsfpczpdwfqa).
-- Hardware asli punya 5 channel (2 resistif + 3 kapasitif), bukan cuma 2 seperti
-- yang diasumsikan sebelumnya (capacitance_raw/lig_raw). Kolom itu TETAP dipertahankan
-- (backend yang menurunkannya dari Kap_7/Res_15 demi kompatibilitas mundur dengan
-- app yang sudah ada) — lihat OSTOSENSE-AI/docs/real-pilot-data-audit-v0.1.md.

alter table public.sensor_logs
  add column if not exists res_15_raw int,
  add column if not exists res_16_raw int,
  add column if not exists kap_4_raw int,
  add column if not exists kap_5_raw int,
  add column if not exists kap_7_raw int;
