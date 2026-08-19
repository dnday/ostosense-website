"use client";

import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { UserProfile } from "@/types/user";
import { useEffect, useState } from "react";

export function AppHeader({
  view,
}: {
  view: "home" | "patients" | "notifications";
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

    // Mengambil profil user secara dinamis dari API route
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");
        const json = await response.json();
        if (json.success) {
          setUser(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil profil", error);
      }
    }

    fetchProfile();
  }, []);

  return (
    <header className="mr-4 flex min-h-[105px] items-center justify-between border-b border-slate-100 bg-white px-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <GreetingIcon size={20} className="text-amber-400" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {user ? `${greeting}, ${user.role} ${user.name}` : "Memuat..."}
          </h1>
        </div>
        <p className="pl-8 text-sm font-medium text-slate-500">
          {user ? user.currentShift : ""}
        </p>
      </div>
    </header>
  );
}
