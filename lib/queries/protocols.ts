import { createClient } from "@/lib/supabase/server";

export async function getPatientProtocol(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("protocols")
    .select("*")
    .eq("patient_id", patientId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getAllProtocolsByPatient(patientId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("protocols")
    .select("*")
    .eq("patient_id", patientId)
    .order("version", { ascending: false });

  return data ?? [];
}
