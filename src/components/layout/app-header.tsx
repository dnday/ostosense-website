"use client";

import { ChevronRight, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { UserProfile } from "@/types/user";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 pl-8 text-xs font-medium text-slate-400">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
            {item.onClick && !isLast ? (
              <button onClick={item.onClick} className="hover:text-slate-600 hover:underline">
                {item.label}
              </button>
            ) : (
              <span className={isLast ? "text-slate-600" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppHeader({
  view,
  pathname,
  patientName,
  onNavigateHome,
}: {
  view: "home" | "patients" | "notifications";
  pathname?: string;
  patientName?: string;
  onNavigateHome?: () => void;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [greeting, setGreeting] = useState("Selamat Datang");

  const GreetingIcon =
    greeting === "Selamat Pagi"
      ? Sunrise
      : greeting === "Selamat Siang"
        ? Sun
        : greeting === "Selamat Sore"
          ? Sunset
          : Moon;

  useEffect(() => {
    // Menentukan ucapan berdasarkan waktu lokal
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setGreeting("Selamat Pagi");
    } else if (hour >= 11 && hour < 15) {
      setGreeting("Selamat Siang");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore");
    } else {
      setGreeting("Selamat Malam");
    }

    // Mengambil profil dari sesi Supabase yang sedang login
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email || "Pengguna",
        // ponytail: role/unit/shift belum ada tabel staf di Supabase; placeholder sampai fitur roster staf digarap.
        role: "Perawat",
        unit: "",
        currentShift: "",
        isShiftActive: false,
      });
    });
  }, []);

  const crumbs: { label: string; onClick?: () => void }[] =
    pathname === "/settings"
      ? [{ label: "Beranda", onClick: onNavigateHome }, { label: "Setelan" }]
      : view === "notifications"
        ? [{ label: "Beranda", onClick: onNavigateHome }, { label: "Notifikasi" }]
        : view === "patients"
          ? [{ label: "Beranda", onClick: onNavigateHome }, { label: "Pasien" }, ...(patientName ? [{ label: patientName }] : [])]
          : [{ label: "Beranda" }];

  return (
    <header className="mr-4 flex min-h-[105px] flex-col justify-center gap-1.5 border-b border-slate-100 bg-white px-8">
      <Breadcrumb items={crumbs} />
      <div className="flex items-center gap-3">
        <GreetingIcon size={20} className="text-amber-400" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {user ? `${greeting}, ${user.role} ${user.name}` : "Memuat..."}
        </h1>
      </div>
    </header>
  );
}
