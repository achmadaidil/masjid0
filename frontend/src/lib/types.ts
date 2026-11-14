// Hand-written mirrors of the backend Pydantic models — nothing infers across the HTTP
// boundary, so this file and backend/models/*.py must change together.

export type EventType = "kajian" | "donasi" | "sosial" | "pelatihan" | "peringatan";

export const EVENT_TYPES: EventType[] = ["kajian", "donasi", "sosial", "pelatihan", "peringatan"];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  kajian: "Kajian",
  donasi: "Donasi",
  sosial: "Sosial",
  pelatihan: "Pelatihan",
  peringatan: "Peringatan Hari Besar",
};

export interface Event {
  id: string;
  title: string;
  type: EventType;
  description: string;
  location: string;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM, may be empty
  image_url: string | null;
  is_published: boolean;
  donation_target: number | null;
  donation_collected: number;
  registration_count: number;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  whatsapp: string;
  address: string;
  notes: string;
  created_at: string;
}

export interface RegistrationCreate {
  name: string;
  whatsapp: string;
  address: string;
  notes: string;
}

export interface AppSettings {
  key: string;
  mosque_name: string;
  mosque_address: string;
  wa_admin_number: string;
  bank_info: string;
  updated_at: string | null;
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
}
