export type PatientType = "inap" | "jalan";

export type Patient = {
  name: string;
  type: PatientType;
  location: string;
  risk?: number;
  level: number;
  skin: number;
};
