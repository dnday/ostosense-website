-- Jalankan sekali di Supabase Dashboard -> SQL Editor (project jmjxhtksvsfpczpdwfqa).
-- Pisahin akun nakes (web dashboard) dari akun pasien (mobile app) yang share Supabase Auth yang sama.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('nakes', 'pasien')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
