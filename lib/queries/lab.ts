import { createClient } from "@/lib/supabase/server";

export async function getLabFiles(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lab_files")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
