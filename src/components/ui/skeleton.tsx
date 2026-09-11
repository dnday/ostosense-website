export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

// Placeholder roster+ringkasan dipakai selagi auth/patients pertama kali dimuat —
// biar nakes gak lihat state kosong "Belum ada pasien" sekilas sebelum data nyata datang.
export function DashboardSkeleton() {
  return (
    <div className="py-8 pr-12 pl-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-10 h-7 w-48" />
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
            <Skeleton className="mt-5 h-1.5 w-full" />
            <Skeleton className="mt-4 h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
