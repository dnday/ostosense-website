import { NextResponse } from 'next/server';
import { NotificationData, NotificationType } from '@/types/notification';
import { getPatientNameBySessionId } from '@/lib/patient';
import { supabase } from '@/lib/supabase';

// Kontrak: OSTOSENSE-AI/docs/ai-software-integration-contract-v0.2.md — cuma boleh
// nampilin Urgent/Caution sebagai notifikasi, bukan angka probabilitas buatan.
const TYPE_BY_RISK_CLASS: Record<string, NotificationType> = {
  Urgent: 'CRITICAL',
  Caution: 'WARNING',
};

const MESSAGE_BY_RISK_CLASS: Record<string, string> = {
  Urgent: 'Klasifikasi AI: Urgent — perlu tindakan segera',
  Caution: 'Klasifikasi AI: Caution — pantau lebih ketat',
};

export async function GET() {
  const { data, error } = await supabase
    .from('ai_predictions')
    .select('session_id, received_at, model_status, prediction_available, risk_class')
    .eq('prediction_available', true)
    .in('risk_class', ['Urgent', 'Caution'])
    .order('received_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }

  const notifications: NotificationData[] = [];
  for (const row of data ?? []) {
    const riskClass = row.risk_class as string;
    const type = TYPE_BY_RISK_CLASS[riskClass];
    if (!type) continue; // status lain (mis. model_status TEST_ONLY tanpa risk_class valid) dilewati
    notifications.push({
      id: `${row.session_id}-${row.received_at}`,
      patientName: getPatientNameBySessionId(row.session_id) ?? row.session_id,
      title: type === 'CRITICAL' ? 'Peringatan Risiko Kritis' : 'Peringatan Risiko',
      message: MESSAGE_BY_RISK_CLASS[riskClass],
      type,
      timestamp: row.received_at,
      isRead: false,
    });
  }

  return NextResponse.json({ success: true, data: notifications });
}
