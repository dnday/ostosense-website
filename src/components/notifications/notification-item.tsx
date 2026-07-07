import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { NotificationData } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationData;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  // Styling berdasarkan tipe notifikasi
  const typeStyles = {
    CRITICAL: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    WARNING: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconColor: 'text-orange-500',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    },
    INFO: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconColor: 'text-slate-500',
      icon: <Info className="h-5 w-5 text-slate-500" />,
    },
  };

  const style = typeStyles[notification.type];
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { 
    addSuffix: true,
    locale: idLocale 
  });

  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${style.bg} ${style.border} ${!notification.isRead ? 'ring-1 ring-slate-200' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white p-1 shadow-sm">
          {style.icon}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-col">
            <h4 className="font-semibold text-slate-900">
              {notification.patientName 
                ? `${notification.patientName} - ${notification.title}`
                : notification.title}
            </h4>
            <p className="text-sm text-slate-600">{notification.message}</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">{timeAgo}</span>
        </div>
        {!notification.isRead && (
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
