import { createClient } from "@/lib/supabase/server";

export async function getMessages(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getLastMessage(patientId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getUnreadCount(patientId: string, fromSender: "medico" | "paciente") {
  const supabase = await createClient();

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("patient_id", patientId)
    .eq("sender", fromSender)
    .is("read_at", null);

  return count ?? 0;
}
