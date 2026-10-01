"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, BellRing, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import supabase disiapkan untuk real logic

const FEATURES = [
  { icon: ShieldCheck, text: "Status risiko Safe, Monitor, Caution, dan Urgent" },
  { icon: Activity, text: "Grafik sinyal sensor kapasitif dan LIG per pasien" },
  { icon: BellRing, text: "Notifikasi pasien yang perlu tindakan segera" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "wrong_role") {
      setError("Akun ini terdaftar sebagai pasien di app mobile OstoSense, bukan akun nakes. Gunakan akun nakes untuk masuk ke dashboard ini.");
    } else if (errorParam === "role_check_failed") {
      setError("Gagal memverifikasi akun, coba lagi. Jika masih gagal, hubungi admin.");
    }
  }, [searchParams]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace("/");
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Sukses: browser dialihkan ke halaman login Google oleh Supabase.
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Navy Branding */}
      <div className="hidden lg:flex lg:w-[57%] flex-col justify-between px-10 xl:px-[89px] py-12 relative overflow-hidden bg-gradient-to-br from-[#1D2F4A] via-[#22365A] to-[#14223A]">
        {/* Siluet logo transparan di belakang */}
        <Image
          src="/Logo.svg"
          alt=""
          aria-hidden
          width={800}
          height={800}
          className="pointer-events-none absolute -right-40 -bottom-40 h-auto w-[70%] max-w-none brightness-0 invert opacity-[0.04]"
        />

        <div className="relative z-10 flex items-center gap-3">
          <Image src="/Logo.svg" alt="OstoSense" width={48} height={48} className="brightness-0 invert shrink-0" priority />
          <span className="text-2xl tracking-[-0.5px] text-white">
            <span className="font-bold">OSTO</span>
            <span className="font-light">SENSE</span>
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-10">
          <div className="flex max-w-[520px] flex-col gap-6">
            <span className="w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-[#bfdbfe]">
              Dashboard Tenaga Kesehatan
            </span>
            <h1 className="text-[clamp(32px,3.2vw,48px)] font-semibold leading-[1.1] tracking-[-1px] text-white">
              Pantau risiko kebocoran kantong stoma pasien dari satu layar.
            </h1>
            <p className="text-base xl:text-lg leading-7 text-[#dbeafe]/80">
              Sensor kapasitif dan resistif membaca kondisi kantong secara real-time, lalu AI
              mengelompokkannya ke empat tingkat risiko.
            </p>
            <ul className="flex flex-col gap-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm xl:text-base text-white/90">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="size-[18px] text-[#93c5fd]" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <Image
            src="/Group 19402.png"
            alt=""
            aria-hidden
            width={375}
            height={456}
            className="hidden xl:block h-auto w-[220px] 2xl:w-[260px] shrink-0 drop-shadow-2xl"
          />
        </div>

        <p className="relative z-10 text-sm text-white/50">PKM-KC 2026 · Universitas Gadjah Mada</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-[43%] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-16">
        {/* Logo mobile */}
        <div className="mb-12 flex lg:hidden flex-col items-center gap-4">
          <Image src="/Logo.svg" alt="OstoSense Logo" width={64} height={64} />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">OstoSense</h1>
        </div>

        <div className="flex w-full max-w-[364px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-[30px] font-semibold tracking-[-0.6px] text-[#0F172B]">Selamat datang</h2>
            <p className="text-base text-[#45556C]">Masuk untuk memantau pasien Anda</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[#0F172B]">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@rumahsakit.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[52px] w-full rounded-[10px] border border-[#E2E8F0] bg-transparent px-3 text-slate-900 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-[#0F172B]">Kata sandi</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[52px] w-full rounded-[10px] border border-[#E2E8F0] bg-transparent pl-3 pr-12 text-slate-900 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-[#62748E] hover:bg-slate-100 hover:text-[#283953]"
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-1 flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#283953] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1D2F4A] disabled:opacity-60"
            >
              {loading && <Loader2 className="size-[18px] animate-spin" aria-hidden />}
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#E2E8F0]"></div>
            <span className="text-sm font-medium text-[#62748E]">atau</span>
            <div className="h-[1px] flex-1 bg-[#E2E8F0]"></div>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#0F172B] shadow-sm transition-colors hover:bg-[#f8fafc] disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4285F4] border-t-transparent"></div>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {googleLoading ? "Menghubungkan ke Google..." : "Masuk dengan Google"}
          </button>

          <p className="text-center text-sm leading-6 text-[#62748E]">
            Khusus tenaga kesehatan. Pasien menggunakan aplikasi mobile OstoSense.
            <br />
            Lupa kata sandi? Hubungi admin.
          </p>
        </div>
      </div>
    </div>
  );
}
