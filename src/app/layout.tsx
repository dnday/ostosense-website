import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OstoSense",
  description: "Sistem pemantauan pasien OstoSense",
  icons: {
    icon: "/Logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className={`min-h-full flex flex-col relative ${poppins.className}`}>
        {/* Mobile Blocker Overlay */}
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 p-8 text-center md:hidden">
          <div className="mb-6 rounded-full bg-blue-100 p-5 text-blue-600">
            <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Gunakan Laptop / PC</h2>
          <p className="text-base leading-relaxed text-slate-600">
            Sistem pemantauan OstoSense dirancang khusus untuk layar besar guna menjaga akurasi pembacaan data klinis. Tolong akses melalui Laptop atau Komputer Desktop.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
