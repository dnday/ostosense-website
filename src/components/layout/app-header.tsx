"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { UserProfile } from "@/types/user";

export function AppHeader({ view }: { view: "home" | "patients" | "notifications" }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [greeting, setGreeting] = useState("Selamat Datang");

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
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-normal leading-8">
          <Icon name="sun" className="text-orange-500" />
          {user ? `${greeting}, ${user.role} ${user.name}` : `${greeting}...`}
        </h1>
        <p className="ml-[34px] mt-1 text-sm text-slate-500">
          {user ? `${user.unit} • ${user.currentShift}` : "Memuat profil..."}
        </p>
      </div>
      
    </header>
  );
}
