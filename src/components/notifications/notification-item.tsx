import { useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { NotificationData } from '@/types/notification';
import { Alert, AlertIcon, AlertTitle, AlertDescription, AlertContent, AlertToolbar } from '@/components/ui/alert-1';
import { Button } from '@/components/ui/button-1';

interface NotificationItemProps {
  notification: NotificationData;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();

  // Mapping tipe notifikasi ke variant Alert
  const typeMapping: Record<string, "destructive" | "warning" | "info"> = {
    CRITICAL: "destructive",
    WARNING: "warning",
    INFO: "info",
  };

  const iconMapping: Record<string, React.ReactNode> = {
    CRITICAL: <AlertCircle />,
    WARNING: <AlertTriangle />,
    INFO: <Info />,
  };

  const alertVariant = typeMapping[notification.type] || "info";
  const IconComponent = iconMapping[notification.type] || <Info />;
  
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { 
    addSuffix: true,
    locale: idLocale 
  });

  const handleTinjauPasien = () => {
    if (notification.patientName) {
      router.push(`/?view=patients&patient=${encodeURIComponent(notification.patientName)}`);
    } else {
      router.push(`/?view=patients`);
    }
  };

  return (
    <div className="relative mb-2">
      <Alert 
        variant={alertVariant} 
        appearance="light" 
        className={`w-full transition-all duration-200 ${!notification.isRead ? 'shadow-sm bg-opacity-100 ring-1 ring-blue-500/20' : 'opacity-80 grayscale-[20%]'}`}
      >
        <AlertIcon>
          {IconComponent}
        </AlertIcon>
        
        <AlertContent className="w-full flex-1">
          <AlertTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 w-full text-slate-900">
            <span className="font-semibold text-base tracking-tight">
              {notification.patientName 
                ? `${notification.patientName} — ${notification.title}`
                : notification.title}
            </span>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap sm:mt-1">
              {timeAgo}
            </span>
          </AlertTitle>
          
          <AlertDescription className="text-slate-600 mt-1">
            {notification.message}
          </AlertDescription>
          
          <AlertToolbar className="mt-2.5">
            <Button 
              variant="inverse" 
              mode="link" 
              underlined="solid" 
              size="sm" 
              className="font-medium"
              onClick={handleTinjauPasien}
            >
              Tinjau Pasien
            </Button>
          </AlertToolbar>
        </AlertContent>
      </Alert>

      {/* Unread Indicator Dot */}
      {!notification.isRead && (
        <div className="absolute -right-1 -top-1 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white" />
      )}
    </div>
  );
}
