import { Icon } from "@/components/ui/icon";
import Image from "next/image";

export function AppSidebar({
  view,
  onNavigate,
}: {
  view: "home" | "patients" | "notifications";
  onNavigate: (view: "home" | "patients" | "notifications") => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col items-center gap-8 bg-[#1d2f4a] py-8 text-slate-300">
      <div className="grid size-12 place-items-center">
        <Image src="/Logo.svg" alt="OstoSense Logo" width={40} height={40} />
      </div>
      <nav className="flex flex-1 flex-col gap-4" aria-label="Navigasi utama">
        <button
          aria-label="Beranda"
          onClick={() => onNavigate("home")}
          className={`grid size-12 place-items-center rounded-[14px] hover:bg-white/10 ${view === "home" ? "bg-white/20 text-white" : ""}`}
        >
          <Icon name="home" />
        </button>
        <button
          aria-label="Daftar pasien"
          onClick={() => onNavigate("patients")}
          className={`grid size-12 place-items-center rounded-[14px] hover:bg-white/10 ${view === "patients" ? "bg-white/20 text-white" : ""}`}
        >
          <Icon name="users" />
        </button>
        <button
          aria-label="Notifikasi"
          onClick={() => onNavigate("notifications")}
          className={`grid size-12 place-items-center rounded-[14px] hover:bg-white/10 ${view === "notifications" ? "bg-white/20 text-white" : ""}`}
        >
          <Icon name="bell" />
        </button>
        <button
          aria-label="Pengaturan"
          className="grid size-12 place-items-center rounded-[14px] hover:bg-white/10"
        >
          <Icon name="gear" />
        </button>
      </nav>
      <div className="flex w-12 flex-col items-center gap-3 border-t border-white/10 pt-4">
        <button
          aria-label="Profil NS"
          className="size-12 rounded-full border-2 border-white/30 bg-white/20 text-sm text-white"
        >
          NS
        </button>
        <button
          aria-label="Keluar"
          className="grid size-10 place-items-center rounded-[10px]"
        >
          <Icon name="door" size={16} />
        </button>
      </div>
    </aside>
  );
}
