import type { Patient } from "@/types/patient";

export const patients: Patient[] = [
  {
    name: "John Martinez",
    type: "inap",
    location: "Tempat Tidur 12",
    risk: 92,
    level: 85,
    skin: 54,
  },
  {
    name: "Thomas Brown",
    type: "jalan",
    location: "Rumah",
    risk: 88,
    level: 88,
    skin: 60,
  },
  {
    name: "Emily Johnson",
    type: "inap",
    location: "Tempat Tidur 7",
    risk: 75,
    level: 78,
    skin: 72,
  },
  {
    name: "Michael Chen",
    type: "inap",
    location: "Tempat Tidur 3",
    risk: 58,
    level: 52,
    skin: 68,
  },
  {
    name: "Sarah Williams",
    type: "jalan",
    location: "Rumah",
    level: 30,
    skin: 82,
  },
  {
    name: "David Thompson",
    type: "inap",
    location: "Tempat Tidur 8",
    level: 18,
    skin: 80,
  },
  {
    name: "Lisa Anderson",
    type: "jalan",
    location: "Rumah",
    level: 25,
    skin: 85,
  },
  {
    name: "Robert Garcia",
    type: "inap",
    location: "Tempat Tidur 11",
    level: 44,
    skin: 74,
  },
  {
    name: "Jennifer Lee",
    type: "jalan",
    location: "Rumah",
    level: 37,
    skin: 88,
  },
  {
    name: "Maria Garcia",
    type: "jalan",
    location: "Rumah",
    level: 41,
    skin: 78,
  },
];

// Data roster sengaja dikosongkan sampai terhubung ke sumber data pasien.
export const rosterPatients: Patient[] = [];
