"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";

// Link build APK preview EAS terbaru — ganti tiap kali build baru di-generate
// (sama seperti DOWNLOAD_APK_URL di mobileapp/src/constants/api.ts, belum ada channel auto-update).
export const DOWNLOAD_APK_URL = "https://expo.dev/artifacts/eas/T7j8fku8ZVo8oPWaQdkQhWSINVSxzf7VJu45Vvu--po.apk";

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1d2f4a&data=${encodeURIComponent(DOWNLOAD_APK_URL)}`;
const DISMISS_KEY = "ostosense-download-popup-dismissed";

export function DownloadAppModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem(DISMISS_KEY)) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172b]/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Gradient header */}
        <div className="relative flex flex-col items-center bg-gradient-to-br from-[#1D2F4A] to-[#2d4568] px-6 pb-6 pt-7">
          <button
            onClick={close}
            aria-label="Tutup"
            className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/85 transition-colors hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Image src="/Logo.svg" alt="OstoSense" width={40} height={40} />
          </div>
          <h2 className="text-lg font-bold text-white">OstoSense</h2>
          <p className="mt-0.5 text-center text-xs text-white/70">
            Pemantauan kantong kolostomi real-time
          </p>
        </div>

        <div className="flex flex-col items-center gap-3.5 p-6">
          <p className="text-center text-sm leading-relaxed text-slate-500">
            Dashboard ini untuk tenaga kesehatan. Pasien memantau kondisi kantong lewat aplikasi mobile terpisah.
          </p>

          <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- external QR image, not a local asset */}
            <img src={QR_URL} alt="QR download APK OstoSense" className="h-[150px] w-[150px] rounded-lg" />
            <span className="text-xs font-semibold text-slate-500">Scan untuk download</span>
          </div>

          <a
            href={DOWNLOAD_APK_URL}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#283953] text-sm font-semibold text-white shadow-lg shadow-[#283953]/30 transition-colors hover:bg-[#1D2F4A]"
          >
            <Download className="h-4 w-4" />
            Download APK
          </a>
          <button onClick={close} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}
