"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { PatientWorkspace } from "@/components/dashboard/patient-workspace";
import type { Patient } from "@/types/patient";
import { supabase } from "@/lib/supabase";
// Fallback data if DB fails
import { patients as fallbackPatients, rosterPatients as fallbackRoster } from "@/data/patients";

function ShellContent({ children }: { children?: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"home" | "patients">(searchParams.get("view") === "patients" ? "patients" : "home");
  const [selectedName, setSelectedName] = useState(searchParams.get("patient") || "Thomas Brown");
  
  // Realtime Supabase State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const authRouter = useRouter();
  useEffect(() => {
    // ponytail: token cuma dicek keberadaannya di client; validasi server-side saat auth beneran dipakai.
    if (!localStorage.getItem("ostosense_token")) {
      authRouter.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [authRouter]);

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
  const rosterPatients = patients;

  const router = useRouter();
  const pathname = usePathname();

  const openPatient = (name: string) => {
    setSelectedName(name);
    setView("patients");
    router.push(`/?view=patients&patient=${encodeURIComponent(name)}`);
  };

  const handleNavigate = (newView: "home" | "patients" | "notifications") => {
    if (newView === "notifications") {
      router.push("/notifications");
    } else {
      setView(newView);
      if (newView === "home") {
        router.push("/");
      } else {
        router.push(`/?view=patients&patient=${encodeURIComponent(selectedName)}`);
      }
    }
  };

  let currentView = view as "home" | "patients" | "notifications";
  if (pathname === "/notifications") currentView = "notifications";

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 lg:h-screen lg:overflow-hidden">
      <AppSidebar view={currentView} onNavigate={handleNavigate} />

      <div className="ml-20 min-h-screen lg:h-screen flex flex-col">
        <AppHeader view={currentView as any} />

        {children ? (
          <div className="flex-1 overflow-auto">{children}</div>
        ) : view === "home" ? (
          <DashboardHome patients={patients} />
        ) : (
          <PatientWorkspace
            rosterPatients={rosterPatients}
            selectedPatient={selectedPatient}
            selectedName={selectedName}
            onSelectPatient={openPatient}
          />
        )}
      </div>
    </main>
  );
}

export function DashboardShell({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ShellContent>{children}</ShellContent>
    </Suspense>
  );
}
