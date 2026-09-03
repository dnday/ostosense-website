-- Jalankan sekali di Supabase Dashboard -> SQL Editor (project jmjxhtksvsfpczpdwfqa).
-- Menyimpan Expo push token per device/sesi, dipakai backend buat kirim notifikasi
-- saat sensor mendeteksi kantong penuh atau kontak cairan langsung dari LIG.
-- Bukan buat notifikasi kelas AI (dilarang oleh kontrak integrasi AI v0.2).

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  expo_push_token text not null unique,
  alerts_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_session_idx on public.push_tokens (session_id);
