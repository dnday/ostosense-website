-- Jalankan sekali di Supabase Dashboard -> SQL Editor (project jmjxhtksvsfpczpdwfqa).
-- Tabel `patients` yang asli cuma punya kolom id/name/type/risk; kode web butuh
-- location/level/skin juga (dipakai di dashboard-shell.tsx, patient-workspace.tsx, dll).

alter table public.patients
  add column if not exists location text,
  add column if not exists level int,
  add column if not exists skin int;
