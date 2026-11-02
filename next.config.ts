import type { NextConfig } from "next";

// Alamat tetap untuk QR di slide/poster. Link APK Expo kedaluwarsa, jadi QR
// selalu ke /unduh dan tujuannya cukup diganti di sini.
// ponytail: sementara ke versi web aplikasi; ganti ke link APK EAS setelah build baru.
const UNDUH_TUJUAN = "https://app.ostosense.my.id/";

const nextConfig: NextConfig = {
  async redirects() {
    // permanent: false (307) supaya browser tidak menyimpan tujuan lama
    return [{ source: "/unduh", destination: UNDUH_TUJUAN, permanent: false }];
  },
};

export default nextConfig;
