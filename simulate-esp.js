const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Ambil URL dan KEY dari .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Gagal: URL atau Key Supabase tidak ditemukan di .env.local!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Memulai Simulasi ESP32 OSTOSENSE...");
console.log("Koneksi ke:", SUPABASE_URL);

// Nilai awal sensor
let capBase = 1000;
let ligBase = 1800;

setInterval(async () => {
  // Bikin data berfluktuasi sedikit (random)
  const capValue = capBase + (Math.random() * 10 - 5);
  const ligValue = ligBase + (Math.random() * 5 - 2);
  
  // Jika lewat 15 detik, pura-puranya ada air bocor masuk perlahan
  capBase += 2;
  
  const payload = {
    session_id: "SIM_001",
    capacitance_raw: parseFloat(capValue.toFixed(1)),
    lig_raw: Math.round(ligValue),
    cap_quality: "OK",
    lig_quality: "OK",
    system_quality: "NORMAL",
    event_marker: ""
  };

  const { data, error } = await supabase
    .from('sensor_logs')
    .insert([payload]);

  if (error) {
    console.error("Gagal mengirim data:", error.message);
  } else {
    console.log(`[${new Date().toISOString()}] Terkirim -> Cap: ${payload.capacitance_raw}, LIG: ${payload.lig_raw}`);
  }
}, 1000); // 1000 ms = 1 Hz (tiap detik)
