import { createClient } from "@/lib/supabase/server";

export async function getCurrentPatient() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile, patient };
}

export async function getAllPatients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      profiles!inner(nombre, apellido, email, avatar_initials, role)
    `)
    .order("fecha_registro", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getPatientById(patientId: string) {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select(`
      *,
      profiles!inner(nombre, apellido, email, avatar_initials)
    `)
    .eq("id", patientId)
    .single();

  return patient;
}
