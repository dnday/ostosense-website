"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { PatientWorkspace } from "@/components/dashboard/patient-workspace";
import type { Patient } from "@/types/patient";
import { supabase } from "@/lib/supabase";
// Fallback data if DB fails
import { patients as fallbackPatients, rosterPatients as fallbackRoster } from "@/data/patients";

export function DashboardShell({ children }: { children?: React.ReactNode }) {
  const [view, setView] = useState<"home" | "patients">("home");
  const [selectedName, setSelectedName] = useState("Thomas Brown");
  
  // Realtime Supabase State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Fetch
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('risk', { ascending: false });
        
      if (error || !data || data.length === 0) {
        console.error("Gagal ambil data Supabase, pakai data fallback:", error);
        setPatients(fallbackPatients);
      } else {
        // Map from DB format to our Patient type
        const mappedPatients: Patient[] = data.map((d: any) => ({
          name: d.name,
          type: d.type === 'RS' ? 'inap' : 'jalan',
          location: d.location,
          risk: d.risk,
          level: d.level,
          skin: d.skin
        }));
        setPatients(mappedPatients);
      }
      setIsLoading(false);
    };

    fetchPatients();

    // Subscribe to Realtime Changes
    const channel = supabase
      .channel('public:patients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        (payload) => {
          console.log('Realtime Update!', payload);
          fetchPatients(); // Re-fetch all to keep sorting, or manually update state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute selected patient and roster
  const selectedPatient = patients.find((patient) => patient.name === selectedName) ?? (patients.length > 0 ? patients[0] : fallbackPatients[0]);
  const rosterPatients = patients.filter((p) => p.type === 'inap');

  const router = useRouter();
  const pathname = usePathname();

  const openPatient = (name: string) => {
    setSelectedName(name);
    setView("patients");
  };

  const handleNavigate = (newView: "home" | "patients" | "notifications") => {
    if (newView === "notifications") {
      router.push("/notifications");
    } else {
      if (pathname !== "/") {
        router.push("/");
      } else {
        setView(newView);
      }
    }
  };

  let currentView = view as "home" | "patients" | "notifications";
  if (pathname === "/notifications") currentView = "notifications";

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 lg:h-screen lg:overflow-hidden">
      <AppSidebar view={currentView} onNavigate={handleNavigate} />

      <div className="ml-20 min-h-screen lg:h-screen flex flex-col">
        <AppHeader view={currentView as any} />

        {children ? (
          <div className="flex-1 overflow-auto">{children}</div>
        ) : view === "home" ? (
          <DashboardHome patients={patients} onOpenPatient={openPatient} />
        ) : (
          <PatientWorkspace
            rosterPatients={rosterPatients}
            selectedPatient={selectedPatient}
            selectedName={selectedName}
            onSelectPatient={setSelectedName}
          />
        )}
      </div>
    </main>
  );
}
