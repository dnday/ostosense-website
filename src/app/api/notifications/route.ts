import { NextResponse } from 'next/server';
import { NotificationData } from '@/types/notification';

// Simulasi data dari database (akan diganti dengan query Supabase)
const mockNotifications: NotificationData[] = [
  {
    id: 'notif-1',
    patientName: 'John Martinez',
    title: 'Peringatan Kebocoran Kritis',
    message: 'Probabilitas kebocoran 92% - Periksa segera',
    type: 'CRITICAL',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 menit lalu
    isRead: false,
  },
  {
    id: 'notif-2',
    patientName: 'Emily Johnson',
    title: 'Peringatan Kebocoran',
    message: 'Probabilitas kebocoran 75% - Pantau ketat',
    type: 'WARNING',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(), // 12 menit lalu
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Perubahan Shift',
    message: 'Shift Anda akan berakhir dalam 2 jam',
    type: 'INFO',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 menit lalu
    isRead: true,
  },
];

export async function GET() {
  // Dalam implementasi nyata, di sini Anda bisa mengambil notifikasi user spesifik dari DB
  return NextResponse.json({
    success: true,
    data: mockNotifications,
  });
}
