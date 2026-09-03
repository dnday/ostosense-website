"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { PatientWorkspace } from "@/components/dashboard/patient-workspace";
import type { Patient } from "@/types/patient";
import { supabase } from "@/lib/supabase";
import { ensureRole } from "@/lib/profile";

function ShellContent({ children }: { children?: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"home" | "patients">(searchParams.get("view") === "patients" ? "patients" : "home");
  const [selectedName, setSelectedName] = useState(searchParams.get("patient") || "");

  // Realtime Supabase State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const authRouter = useRouter();
  useEffect(() => {
    // ponytail: sesi hanya divalidasi di client via Supabase; tambahkan middleware SSR bila butuh proteksi server-side.
    const checkSession = async (userId: string | undefined) => {
      if (!userId) {
        authRouter.replace("/login");
        return;
      }
      const result = await ensureRole(userId, "nakes");
      if (!result.ok) {
        await supabase.auth.signOut();
        authRouter.replace(result.actualRole ? "/login?error=wrong_role" : "/login?error=role_check_failed");
        return;
      }
      setAuthChecked(true);
    };

    supabase.auth.getSession().then(({ data }) => checkSession(data.session?.user.id));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session?.user.id);
    });
    return () => subscription.subscription.unsubscribe();
  }, [authRouter]);

  useEffect(() => {
    // Initial Fetch
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('risk', { ascending: false });
        
      if (error) {
        // Jujur: gagal ambil data itu error, bukan alasan buat nampilin pasien buatan
        // yang kelihatan seperti data nyata (lihat MUST FIX dashboard di kontrak AI).
        console.error("Gagal ambil data pasien dari Supabase:", error);
        setLoadError(true);
        setPatients([]);
      } else {
        setLoadError(false);
        // Map from DB format to our Patient type
        const mappedPatients: Patient[] = (data ?? []).map((d: any) => ({
          name: d.name,
          type: d.type === 'RS' ? 'inap' : 'jalan',
          location: d.location,
          risk: d.risk,
          level: d.level,
          skin: d.skin
        }));
        setPatients(mappedPatients);
        setSelectedName((current) =>
          current && mappedPatients.some((p) => p.name === current)
            ? current
            : mappedPatients[0]?.name ?? "",
        );
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
  const selectedPatient = patients.find((patient) => patient.name === selectedName) ?? patients[0];
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
        ) : loadError ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <p className="text-sm font-medium text-rose-600">Gagal memuat data pasien</p>
              <p className="mt-1 text-xs text-slate-400">Coba muat ulang halaman ini.</p>
            </div>
          </div>
        ) : view === "home" ? (
          <DashboardHome patients={patients} />
        ) : selectedPatient ? (
          <PatientWorkspace
            rosterPatients={rosterPatients}
            selectedPatient={selectedPatient}
            selectedName={selectedName}
            onSelectPatient={openPatient}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <p className="text-sm font-medium text-slate-500">Belum ada pasien.</p>
          </div>
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
