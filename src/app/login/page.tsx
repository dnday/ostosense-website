"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import supabase disiapkan untuk real logic

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
      <div className="hidden lg:flex lg:w-[57%] flex-col justify-center gap-8 xl:gap-12 px-10 xl:px-[89px] py-12 relative overflow-hidden bg-[#1D2F4A]">
        {/* Siluet logo transparan di belakang */}
        <Image
          src="/Logo.svg"
          alt=""
          aria-hidden
          width={800}
          height={800}
          className="pointer-events-none absolute -right-40 -bottom-40 h-auto w-[70%] max-w-none brightness-0 invert opacity-[0.04]"
        />

        <div className="relative z-10 flex items-center gap-4 xl:gap-6">
          <Image
            src="/Logo.svg"
            alt="OstoSense"
            width={106}
            height={106}
            className="brightness-0 invert shrink-0 h-auto w-16 xl:w-[106px]"
            priority
          />
          <h2 className="text-[clamp(40px,5.5vw,84px)] leading-[0.86] tracking-[-1.44px] text-white whitespace-nowrap">
            <span className="font-bold">OSTO</span>
            <span className="font-light">SENSE</span>
          </h2>
        </div>

        <p className="relative z-10 max-w-[669px] text-lg xl:text-xl leading-7 text-[#dbeafe]">
          Sistem peringatan dini cerdas yang menggabungkan sensor Laser-Induced
          Graphene (LIG) dan analisis degradasi hidrokoloid untuk memantau
          risiko kebocoran, kesehatan kulit, dan volume kantong secara
          real-time.
        </p>
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
            <h2 className="text-[30px] font-semibold tracking-[-0.6px] text-[#0F172B]">Welcome back</h2>
            <p className="text-base text-[#45556C]">Sign in to access your dashboard</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <input
              id="email"
              type="email"
              required
              aria-label="Email Address"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[58px] w-full rounded-[10px] border border-[#E2E8F0] bg-transparent px-3 text-slate-900 outline-none transition-all placeholder:text-[#62748E] focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
            />

            <input
              id="password"
              type="password"
              required
              aria-label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[58px] w-full rounded-[10px] border border-[#E2E8F0] bg-transparent px-3 text-slate-900 outline-none transition-all placeholder:text-[#62748E] focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
            />

            {error && (
              <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 cursor-pointer rounded border-[#D9D9D9] text-[#283953] focus:ring-[#283953]"
                />
                <label htmlFor="remember" className="cursor-pointer text-sm text-[#45556C]">
                  Remember me
                </label>
              </div>
              <Link href="#" className="text-sm font-medium text-[#283953] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 flex h-[56px] w-full items-center justify-center rounded-[10px] bg-[#283953] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1D2F4A] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#E2E8F0]"></div>
            <span className="text-sm font-medium text-[#62748E]">OR</span>
            <div className="h-[1px] flex-1 bg-[#E2E8F0]"></div>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#0F172B] shadow-sm transition-colors hover:bg-[#f8fafc] disabled:opacity-60"
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
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
