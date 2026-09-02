import { supabase } from "@/lib/supabase";

export type Role = "nakes" | "pasien";

/**
 * Web dan mobile app share Supabase Auth yang sama, jadi butuh tabel `profiles`
 * buat mastiin akun nakes (web) gak bisa dipakai login di app pasien (mobile), atau sebaliknya.
 * Pengguna baru otomatis di-assign `role` sesuai app tempat dia pertama kali login.
 */
export async function ensureRole(
  userId: string,
  role: Role,
): Promise<{ ok: true } | { ok: false; actualRole: Role }> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!data) {
    await supabase.from("profiles").insert({ id: userId, role });
    return { ok: true };
  }
  if (data.role !== role) return { ok: false, actualRole: data.role };
  return { ok: true };
}
