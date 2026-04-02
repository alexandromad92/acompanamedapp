"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import type { PatientWithMessages } from "./page";

interface MessageRow {
  id: string;
  patient_id: string;
  sender: "medico" | "paciente";
  texto: string;
  created_at: string;
  read_at: string | null;
}

interface Props {
  patients: PatientWithMessages[];
}

export default function InboxClient({ patients: initialPatients }: Props) {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const selectedPatient = patients.find((p) => p.id === selectedId);

  // Load messages when patient changes
  useEffect(() => {
    if (!selectedId) return;

    async function loadMessages() {
      setLoadingMessages(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", selectedId!)
        .order("created_at", { ascending: true });

      setMessages((data ?? []) as MessageRow[]);
      setLoadingMessages(false);

      // Mark patient messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("patient_id", selectedId!)
        .eq("sender", "paciente")
        .is("read_at", null);

      setPatients((prev) =>
        prev.map((p) => (p.id === selectedId ? { ...p, unreadCount: 0 } : p))
      );
    }

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Auto scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedId) return;

    const channel = supabase
      .channel(`medico-inbox:${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `patient_id=eq.${selectedId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setPatients((prev) =>
            prev.map((p) =>
              p.id === selectedId
                ? {
                    ...p,
                    lastMessage: {
                      texto: newMsg.texto,
                      created_at: newMsg.created_at,
                      sender: newMsg.sender,
                    },
                  }
                : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, supabase]);

  function selectPatient(id: string) {
    setSelectedId(id);
    setShowChat(true);
    setInput("");
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setInput("");

    const { data, error } = await supabase
      .from("messages")
      .insert({ patient_id: selectedId, sender: "medico", texto: text })
      .select()
      .single();

    if (error) {
      toast.error("Error al enviar mensaje");
      setInput(text);
    } else if (data) {
      setMessages((prev) => [...prev, data as MessageRow]);
      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedId
            ? {
                ...p,
                lastMessage: {
                  texto: text,
                  created_at: new Date().toISOString(),
                  sender: "medico",
                },
              }
            : p
        )
      );
    }

    setSending(false);
  }

  return (
    <div className="flex h-screen">
      {/* Patient List */}
      <div
        className={`${
          showChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 border-r border-gray-100 bg-white flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Mensajes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Bandeja de pacientes</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No hay pacientes aún</p>
            </div>
          ) : (
            patients.map((p) => {
              const isSelected = p.id === selectedId;
              const timeLabel = p.lastMessage
                ? formatTime(p.lastMessage.created_at)
                : null;
              return (
                <button
                  key={p.id}
                  onClick={() => selectPatient(p.id)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-[#E1F5EE] border-l-2 border-l-[#0F6E56]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-[#E1F5EE] rounded-full flex items-center justify-center text-[#0F6E56] font-bold text-sm">
                        {p.avatar}
                      </div>
                      {p.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF9F27] text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {p.unreadCount > 9 ? "9+" : p.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-sm truncate ${
                            p.unreadCount > 0
                              ? "font-bold text-gray-900"
                              : "font-semibold text-gray-800"
                          }`}
                        >
                          {p.nombre} {p.apellido}
                        </p>
                        {timeLabel && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {timeLabel}
                          </span>
                        )}
                      </div>
                      {p.lastMessage ? (
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            p.unreadCount > 0
                              ? "text-gray-800 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {p.lastMessage.sender === "medico" ? "Tú: " : ""}
                          {p.lastMessage.texto}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-300 mt-0.5">
                          Sin mensajes
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`${
          !showChat ? "hidden md:flex" : "flex"
        } flex-1 flex-col bg-[#FAFAFA]`}
      >
        {!selectedPatient ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageCircle className="w-14 h-14 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Selecciona un paciente</p>
            <p className="text-sm text-gray-400 mt-1">
              Elige un paciente de la lista para ver su conversación
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={() => setShowChat(false)}
                className="md:hidden text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 bg-[#E1F5EE] rounded-full flex items-center justify-center text-[#0F6E56] font-bold text-sm flex-shrink-0">
                {selectedPatient.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  {selectedPatient.nombre} {selectedPatient.apellido}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedPatient.pais ?? "—"} ·{" "}
                  {selectedPatient.edad ?? "—"} años
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-400 text-sm">
                    No hay mensajes aún
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Inicia la conversación
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMedico = msg.sender === "medico";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${
                        isMedico ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMedico && (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center text-xs font-bold">
                          {selectedPatient.avatar}
                        </div>
                      )}
                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMedico
                            ? "bg-[#0F6E56] text-white rounded-tr-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {msg.texto}
                        <p className="text-xs mt-1 opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString(
                            "es-ES",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                      {isMedico && (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0F6E56] text-white flex items-center justify-center text-xs font-bold">
                          Dr
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="p-4 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Responder a ${selectedPatient.nombre}...`}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="w-10 h-10 bg-[#0F6E56] text-white rounded-xl flex items-center justify-center hover:bg-[#0d5e49] transition-all disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
