import { supabase } from "@/lib/supabase";

export type Role = "nakes" | "pasien";

type EnsureRoleResult = { ok: true } | { ok: false; actualRole: Role | null };

/**
 * Web dan mobile app share Supabase Auth yang sama, jadi butuh tabel `profiles`
 * buat mastiin akun nakes (web) gak bisa dipakai login di app pasien (mobile), atau sebaliknya.
 * Pengguna baru otomatis di-assign `role` sesuai app tempat dia pertama kali login.
 *
 * Fail-closed: kalau query gagal (mis. tabel `profiles` belum di-migrate), JANGAN
 * anggap "user baru" dan loloskan — itu bikin role check bisa dibypass diam-diam.
 */
export async function ensureRole(userId: string, role: Role): Promise<EnsureRoleResult> {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (error) return { ok: false, actualRole: null };

  if (!data) {
    const { error: insertError } = await supabase.from("profiles").insert({ id: userId, role });
    if (insertError) return { ok: false, actualRole: null };
    return { ok: true };
  }

  if (data.role !== role) return { ok: false, actualRole: data.role };
  return { ok: true };
}
