"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Email atau password salah");
        return;
      }
      const { token, user } = await res.json();
      localStorage.setItem("ostosense_token", token);
      localStorage.setItem("ostosense_user", JSON.stringify(user));
      router.replace("/");
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Navy Branding (Figma 15:365) */}
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

        {/* Product Showcase */}
        <div className="relative z-10 self-center flex w-full max-w-[379px] flex-col items-center rounded-3xl border border-white/20 bg-white/10 p-6 xl:p-8 shadow-[0_25px_50px_0_rgba(0,0,0,0.25)]">
          <div className="w-full max-w-[292px] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-lg">
            <Image
              src="/login-showcase.jpg"
              alt="Pasien menggunakan aplikasi OstoSense"
              width={292}
              height={205}
              className="h-[205px] w-full object-cover"
            />
          </div>
        </div>
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

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#D9D9D9] text-[#283953] focus:ring-[#283953]"
                />
                <label htmlFor="remember" className="cursor-pointer text-sm text-[#45556C]">
                  Remember this device
                </label>
              </div>
              <Link href="#" className="text-sm text-[#1D2F4A] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center rounded-[10px] bg-[#283953] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1D2F4A] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
