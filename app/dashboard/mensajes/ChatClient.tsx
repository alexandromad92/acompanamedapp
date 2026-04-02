"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { MessageBubble } from "@/components/MessageBubble";
import { Send } from "lucide-react";

interface Message {
  id: string;
  patient_id: string;
  sender: "medico" | "paciente";
  texto: string;
  created_at: string;
  read_at: string | null;
}

interface Props {
  patientId: string;
  patientName: string;
  initialMessages: Message[];
}

export default function ChatClient({ patientId, patientName, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Evitar duplicados
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, supabase]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    const { error } = await supabase.from("messages").insert({
      patient_id: patientId,
      sender: "paciente",
      texto: text,
    });

    if (error) {
      toast.error("Error al enviar el mensaje");
      setInput(text); // Restore input
    }

    setSending(false);
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
        <div className="w-10 h-10 bg-[#0F6E56] rounded-full flex items-center justify-center text-sm font-bold text-white">
          Dr
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Tu médico</p>
          <p className="text-xs text-[#0F6E56] flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#0F6E56] rounded-full inline-block" />
            AcompañaMed · responde en &lt;24h
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-[#0F6E56]" />
            </div>
            <p className="text-gray-500 font-medium">No hay mensajes aún</p>
            <p className="text-sm text-gray-400 mt-1">Envíale un mensaje a tu médico</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={{
                id: msg.id,
                de: msg.sender,
                texto: msg.texto,
                fecha: new Date(msg.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
                timestamp: new Date(msg.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
              }}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-[#0F6E56] text-white rounded-xl px-4 py-3 hover:bg-[#0d5e49] transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">Tu médico responde en menos de 24 horas</p>
      </div>
    </div>
  );
}
