"use client";

import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";

// Link build APK preview EAS terbaru — ganti tiap kali build baru di-generate
// (sama seperti DOWNLOAD_APK_URL di mobileapp/src/constants/api.ts, belum ada channel auto-update).
export const DOWNLOAD_APK_URL = "https://expo.dev/artifacts/eas/T7j8fku8ZVo8oPWaQdkQhWSINVSxzf7VJu45Vvu--po.apk";

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(DOWNLOAD_APK_URL)}`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={close}
          aria-label="Tutup"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-[#1D2F4A]/10 p-3 text-[#1D2F4A]">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Download Aplikasi Mobile OstoSense</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dashboard ini untuk tenaga kesehatan. Pasien memantau kondisi kantong lewat aplikasi mobile.
            </p>
          </div>

          <img src={QR_URL} alt="QR download APK OstoSense" className="h-40 w-40 rounded-lg" />

          <a
            href={DOWNLOAD_APK_URL}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#283953] text-sm font-semibold text-white transition-colors hover:bg-[#1D2F4A]"
          >
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
