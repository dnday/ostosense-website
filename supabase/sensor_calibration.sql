-- Jalankan sekali di Supabase Dashboard -> SQL Editor (project jmjxhtksvsfpczpdwfqa).
-- Kalibrasi sensor (capacitance/LIG -> persen) sebelumnya hardcode & duplikat di
-- ostosense-be dan mobileapp. Satu baris singleton di sini jadi sumber kebenarannya,
-- diedit dari web Settings, dibaca oleh mobile app + backend.

create table if not exists public.sensor_calibration (
  id text primary key default 'default',
  cap_empty numeric not null default 1000,
  cap_full numeric not null default 1600,
  lig_base numeric not null default 1800,
  lig_dead numeric not null default 1200,
  humid_high numeric not null default 60,
  updated_at timestamptz not null default now()
);

insert into public.sensor_calibration (id)
values ('default')
on conflict (id) do nothing;
