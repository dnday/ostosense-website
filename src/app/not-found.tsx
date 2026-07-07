"use client";

import { useRef } from "react";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  const containerRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    container.style.setProperty("--mx", `${x}%`);
    container.style.setProperty("--my", `${y}%`);
  };

  const handleMouseLeave = () => {
    const container = containerRef.current;
    if (!container) return;

    container.style.setProperty("--mx", "50%");
    container.style.setProperty("--my", "50%");
  };

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ["--mx" as string]: "50%",
        ["--my" as string]: "50%",
      }}
      className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-6 text-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(29,47,74,0.08),transparent_36%),radial-gradient(circle_at_85%_78%,rgba(14,116,144,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_circle_at_var(--mx)_var(--my),rgba(14,165,233,0.18),transparent_60%)] transition-[background] duration-200 ease-out" />
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-[#1d2f4a]/10 blur-3xl animate-[spin_24s_linear_infinite]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl animate-[spin_30s_linear_infinite_reverse]" />

      <section className="relative z-10 w-full max-w-2xl text-center">
        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 backdrop-blur-sm">
          <span className="grid size-8 place-items-center rounded-full bg-[#1d2f4a] text-white animate-pulse">
            <Icon name="pulse" size={16} />
          </span>
          OstoSense
        </div>

        <p className="mt-10 text-xs font-medium uppercase tracking-[0.35em] text-slate-500">
          404
        </p>
        <h1 className="mt-4 text-4xl font-normal tracking-[-0.04em] text-[#1d2f4a] md:text-6xl animate-[pulse_8s_ease-in-out_infinite]">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
          Alamat yang kamu buka tidak tersedia atau sudah dipindahkan. Kembali
          ke beranda untuk melanjutkan pemantauan pasien.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#1d2f4a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#253d5f]"
          >
            <Icon name="home" size={16} />
            Kembali ke beranda
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-600 underline-offset-4 transition hover:text-[#1d2f4a] hover:underline"
          >
            Buka daftar pasien
          </Link>
        </div>

        <p className="mt-12 text-xs text-slate-400">Route tidak tersedia</p>
      </section>
    </main>
  );
}
