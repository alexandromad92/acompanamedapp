import { createClient } from "@/lib/supabase/server";

export async function getSubscription(patientId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getAllSubscriptions() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select(`
      *,
      patients!inner(
        profiles!inner(nombre, apellido, email)
      )
    `)
    .order("created_at", { ascending: false });

  return data ?? [];
}
