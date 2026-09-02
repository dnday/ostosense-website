"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Home, LogOut, Settings, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { key: "home", label: "Beranda", Icon: Home },
  { key: "patients", label: "Pasien", Icon: Users },
  { key: "notifications", label: "Notifikasi", Icon: Bell },
] as const;

export function AppSidebar({
  view,
  onNavigate,
}: {
  view: "home" | "patients" | "notifications";
  onNavigate: (view: "home" | "patients" | "notifications") => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // Inisial dari user yang login (fallback "NS")
  const [initials, setInitials] = useState("NS");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name: string = data.user?.user_metadata?.full_name ?? data.user?.email ?? "";
      const parts = name.replace(/^Ns\.\s*/i, "").split(/\s+/).filter(Boolean);
      if (parts.length > 0) {
        setInitials(parts.slice(0, 2).map((p) => p[0].toUpperCase()).join(""));
      }
    });
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col items-center bg-[#1d2f4a] py-6">
      <div className="mb-8 grid size-12 place-items-center">
        <Image src="/Logo.svg" alt="OstoSense Logo" width={40} height={40} />
      </div>

      <nav className="flex flex-1 flex-col gap-2" aria-label="Navigasi utama">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(key)}
              className={`flex w-16 flex-col items-center gap-1 rounded-xl py-2.5 transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[10px] leading-3 tracking-wide ${active ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
            </button>
          );
        })}

        <button
          aria-label="Pengaturan"
          aria-current={pathname === "/settings" ? "page" : undefined}
          onClick={() => router.push("/settings")}
          className={`flex w-16 flex-col items-center gap-1 rounded-xl py-2.5 transition-colors ${
            pathname === "/settings"
              ? "bg-white/15 text-white"
              : "text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Settings size={20} strokeWidth={pathname === "/settings" ? 2.2 : 1.8} />
          <span className="text-[10px] font-medium leading-3 tracking-wide">Setelan</span>
        </button>
      </nav>

      <div className="flex w-16 flex-col items-center gap-3 border-t border-white/10 pt-5">
        <button
          aria-label="Profil"
          onClick={() => router.push("/settings")}
          className="grid size-11 place-items-center rounded-full border-2 border-white/30 bg-white/15 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-white/25"
        >
          {initials}
        </button>
        <button
          aria-label="Keluar"
          onClick={handleLogout}
          className="flex w-16 flex-col items-center gap-1 rounded-xl py-2 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span className="text-[10px] font-medium leading-3 tracking-wide">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
