export type NotificationType = 'CRITICAL' | 'WARNING' | 'INFO';

export interface NotificationData {
  id: string;
  patientName?: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
}
