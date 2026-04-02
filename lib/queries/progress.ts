import { createClient } from "@/lib/supabase/server";

export async function getProgressEntries(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("progress_entries")
    .select("*")
    .eq("patient_id", patientId)
    .order("fecha", { ascending: true });

  if (error) return [];
  return data ?? [];
}
