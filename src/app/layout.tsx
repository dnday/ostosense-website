import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OstoSense | Daftar Pasien",
  description: "Daftar dan pemantauan pasien OstoSense",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
