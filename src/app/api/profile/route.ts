import { NextResponse } from 'next/server';
import { UserProfile } from '@/types/user';

// Simulasi mengambil data dari database user
const mockUser: UserProfile = {
  id: 'usr-001',
  name: 'Sarah',
  role: 'Perawat',
  unit: 'Unit ICU A',
  currentShift: 'Shift Pagi',
  isShiftActive: true,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockUser,
  });
}
