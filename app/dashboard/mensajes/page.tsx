import { createClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/queries/messages";
import ChatClient from "./ChatClient";

export default async function MensajesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  const messages = await getMessages(user.id);

  return (
    <ChatClient
      patientId={user.id}
      patientName={profile?.nombre ?? "Paciente"}
      initialMessages={messages}
    />
  );
}
