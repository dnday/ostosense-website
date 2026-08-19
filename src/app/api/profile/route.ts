import { UserProfile } from "@/types/user";
import { NextResponse } from "next/server";

// Simulasi mengambil data dari database user
const mockUser: UserProfile = {
  id: "usr-001",
  name: "Sarah",
  role: "Perawat",
  unit: "Unit ICU A",
  currentShift: "",
  isShiftActive: true,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockUser,
  });
}
