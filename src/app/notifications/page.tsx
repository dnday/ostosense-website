"use client";

import { useEffect, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { NotificationData } from '@/types/notification';
import { NotificationItem } from '@/components/notifications/notification-item';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memanggil API route yang dibuat secara modular
    async function fetchNotifications() {
      try {
        const response = await fetch('/api/notifications');
        const json = await response.json();
        if (json.success) {
          setNotifications(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil notifikasi", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardShell>
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-6 lg:p-8 gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifikasi</h1>
              <p className="text-slate-500 text-sm mt-1">
                Anda memiliki {unreadCount} pesan belum dibaca
              </p>
            </div>
          </div>

          {/* Search/Filter placeholder */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari notifikasi..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              Tidak ada notifikasi saat ini.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notifications.map(notif => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
