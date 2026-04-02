import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InboxClient from "./InboxClient";

interface PatientRow {
  id: string;
  pais: string | null;
  edad: number | null;
  profiles: {
    nombre: string;
    apellido: string | null;
    avatar_initials: string | null;
  };
}

interface MessageRow {
  patient_id: string;
  texto: string;
  created_at: string;
  sender: string;
  read_at: string | null;
}

export interface PatientWithMessages {
  id: string;
  pais: string | null;
  edad: number | null;
  nombre: string;
  apellido: string | null;
  avatar: string;
  lastMessage: { texto: string; created_at: string; sender: string } | null;
  unreadCount: number;
}

export default async function MedicoMensajesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: patients } = await supabase
    .from("patients")
    .select("id, pais, edad, profiles!inner(nombre, apellido, avatar_initials)")
    .order("fecha_registro", { ascending: false });

  const patientList = (patients ?? []) as unknown as PatientRow[];
  const patientIds = patientList.map((p) => p.id);

  let allMessages: MessageRow[] = [];
  if (patientIds.length > 0) {
    const { data: msgData } = await supabase
      .from("messages")
      .select("patient_id, texto, created_at, sender, read_at")
      .in("patient_id", patientIds)
      .order("created_at", { ascending: false });
    allMessages = (msgData ?? []) as MessageRow[];
  }

  const lastMessageMap: Record<string, MessageRow> = {};
  const unreadMap: Record<string, number> = {};

  for (const msg of allMessages) {
    if (!lastMessageMap[msg.patient_id]) {
      lastMessageMap[msg.patient_id] = msg;
    }
    if (msg.sender === "paciente" && !msg.read_at) {
      unreadMap[msg.patient_id] = (unreadMap[msg.patient_id] ?? 0) + 1;
    }
  }

  const patientsWithMessages: PatientWithMessages[] = patientList.map((p) => ({
    id: p.id,
    pais: p.pais,
    edad: p.edad,
    nombre: p.profiles.nombre,
    apellido: p.profiles.apellido,
    avatar: p.profiles.avatar_initials ?? p.profiles.nombre.slice(0, 2).toUpperCase(),
    lastMessage: lastMessageMap[p.id]
      ? {
          texto: lastMessageMap[p.id].texto,
          created_at: lastMessageMap[p.id].created_at,
          sender: lastMessageMap[p.id].sender,
        }
      : null,
    unreadCount: unreadMap[p.id] ?? 0,
  }));

  patientsWithMessages.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    if (a.lastMessage && b.lastMessage) {
      return (
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime()
      );
    }
    if (a.lastMessage) return -1;
    if (b.lastMessage) return 1;
    return 0;
  });

  return <InboxClient patients={patientsWithMessages} />;
}
