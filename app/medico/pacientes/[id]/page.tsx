"use client";
import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ProtocoloBadge } from "@/components/ProtocoloBadge";
import { MessageBubble } from "@/components/MessageBubble";
import { LabFileItem } from "@/components/LabFileItem";
import { ProgressChart } from "@/components/ProgressChart";
import type { ProtocolTipo, Message, LabFile, ProgressEntry } from "@/lib/mock-data";
import {
  ArrowLeft, MapPin, User, Weight, Ruler, Target, Send,
  CheckCircle, Save, Bell, Loader2
} from "lucide-react";

const TABS = ["Resumen", "Protocolo", "Mensajes", "Laboratorio", "Progreso"] as const;
type Tab = typeof TABS[number];

// ── Local types matching Supabase schema ──────────────────────────────────────

interface PatientProfile {
  nombre: string;
  apellido: string | null;
  email: string;
  avatar_initials: string | null;
}

interface PatientData {
  id: string;
  edad: number | null;
  pais: string | null;
  peso_actual: number | null;
  altura: number | null;
  imc: number | null;
  medicamentos_actuales: string | null;
  frustracion_principal: string | null;
  sintomas: string[];
  energia: number | null;
  sueno: number | null;
  libido: number | null;
  objetivos_3_meses: string | null;
  resultado_ideal: string | null;
  fecha_registro: string;
  profiles: PatientProfile;
}

interface ProtocolData {
  id: string;
  patient_id: string;
  titulo: string;
  tipo: ProtocolTipo;
  resumen_caso: string | null;
  diagnostico: string | null;
  plan_medicacion: string | null;
  plan_nutricion: string | null;
  plan_suplementacion: string[];
  plan_ejercicio: string | null;
  plan_seguimiento: string | null;
  que_esperar: string | null;
  que_evitar: string | null;
  senales_alerta: string | null;
  proxima_revision: string | null;
  version: number;
}

// ── Helpers to map Supabase rows → component-compatible shapes ────────────────

function toMessage(row: { id: string; sender: string; texto: string; created_at: string }): Message {
  return {
    id: row.id,
    de: row.sender as "medico" | "paciente",
    texto: row.texto,
    fecha: new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    timestamp: new Date(row.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
}

function toLabFile(row: { id: string; nombre: string; tipo: string | null; estado: string; created_at: string }): LabFile {
  return {
    id: row.id,
    nombre: row.nombre,
    fecha: new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
    estado: row.estado as "Revisado por médico" | "Pendiente de revisión",
    tipo: row.tipo ?? "Documento",
  };
}

function toProgressEntry(row: { id: string; fecha: string; mes: string; peso: number; energia: number; sueno: number; libido: number; notas: string | null }): ProgressEntry {
  return {
    id: row.id,
    fecha: row.fecha,
    mes: row.mes,
    peso: row.peso,
    energia: row.energia,
    sueno: row.sueno,
    libido: row.libido,
    notas: row.notas ?? "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FichaPaciente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);
  const [protoEdit, setProtoEdit] = useState<ProtocolData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [labFiles, setLabFiles] = useState<LabFile[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("Resumen");
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        // Patient + profile
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("*, profiles!inner(nombre, apellido, email, avatar_initials)")
          .eq("id", id)
          .single();

        if (patientError || !patientData) {
          setLoading(false);
          return;
        }
        setPatient(patientData as unknown as PatientData);

        // Protocol (latest version)
        const { data: protoData } = await supabase
          .from("protocols")
          .select("*")
          .eq("patient_id", id)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (protoData) {
          setProtocol(protoData as ProtocolData);
          setProtoEdit(protoData as ProtocolData);
        }

        // Messages
        const { data: msgData } = await supabase
          .from("messages")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: true });

        setMessages((msgData ?? []).map(toMessage));

        // Lab files
        const { data: labData } = await supabase
          .from("lab_files")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false });

        setLabFiles((labData ?? []).map(toLabFile));

        // Progress entries
        const { data: progressData } = await supabase
          .from("progress_entries")
          .select("*")
          .eq("patient_id", id)
          .order("fecha", { ascending: true });

        setProgress((progressData ?? []).map(toProgressEntry));
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-scroll when tab changes to Mensajes or new message arrives
  useEffect(() => {
    if (activeTab === "Mensajes") {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [activeTab, messages]);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const texto = input.trim();
    setInput("");

    const { data, error } = await supabase
      .from("messages")
      .insert({ patient_id: id, sender: "medico", texto })
      .select()
      .single();

    if (error) {
      toast.error("Error al enviar el mensaje");
      return;
    }

    setMessages((prev) => [...prev, toMessage(data)]);
    toast.success("Mensaje enviado");
  }

  async function saveProtocol() {
    if (!protoEdit) return;
    setSaving(true);

    const payload = {
      titulo: protoEdit.titulo,
      tipo: protoEdit.tipo,
      resumen_caso: protoEdit.resumen_caso,
      diagnostico: protoEdit.diagnostico,
      plan_medicacion: protoEdit.plan_medicacion,
      plan_nutricion: protoEdit.plan_nutricion,
      plan_suplementacion: protoEdit.plan_suplementacion,
      plan_ejercicio: protoEdit.plan_ejercicio,
      plan_seguimiento: protoEdit.plan_seguimiento,
      que_esperar: protoEdit.que_esperar,
      que_evitar: protoEdit.que_evitar,
      senales_alerta: protoEdit.senales_alerta,
      proxima_revision: protoEdit.proxima_revision,
      version: protoEdit.version,
    };

    let error;
    if (protocol) {
      // Update existing protocol
      const result = await supabase
        .from("protocols")
        .update(payload)
        .eq("id", protocol.id);
      error = result.error;
    } else {
      // Insert new protocol
      const result = await supabase
        .from("protocols")
        .insert({ ...payload, patient_id: id })
        .select()
        .single();
      error = result.error;
      if (!error && result.data) {
        setProtocol(result.data as ProtocolData);
        setProtoEdit(result.data as ProtocolData);
      }
    }

    setSaving(false);
    if (error) {
      toast.error("Error al guardar el protocolo");
    } else {
      toast.success("Protocolo guardado", { description: "Los cambios se guardaron correctamente." });
    }
  }

  async function notifyPatient() {
    // Insert a system notification message
    const { error } = await supabase
      .from("messages")
      .insert({
        patient_id: id,
        sender: "medico",
        texto: "Tu protocolo ha sido actualizado. Por favor revisa los cambios.",
      });

    if (error) {
      toast.error("Error al notificar al paciente");
    } else {
      toast.success("Paciente notificado", { description: "Se envió una notificación al paciente." });
    }
  }

  async function markReviewed(fileId: string) {
    const { error } = await supabase
      .from("lab_files")
      .update({ estado: "Revisado por médico", reviewed_at: new Date().toISOString() })
      .eq("id", fileId);

    if (error) {
      toast.error("Error al marcar como revisado");
      return;
    }

    setLabFiles((prev) =>
      prev.map((f) => f.id === fileId ? { ...f, estado: "Revisado por médico" as const } : f)
    );
    toast.success("Análisis marcado como revisado");
  }

  // ── Loading / not found states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#0F6E56]" />
        <span className="text-gray-500 text-sm">Cargando datos del paciente…</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-3">Paciente no encontrado</p>
        <Link href="/medico" className="text-[#0F6E56] font-semibold hover:underline">← Volver al panel</Link>
      </div>
    );
  }

  const profile = patient.profiles;
  const avatar = profile.avatar_initials ?? profile.nombre.slice(0, 2).toUpperCase();
  const nombreCompleto = `${profile.nombre}${profile.apellido ? " " + profile.apellido : ""}`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen md:h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 p-4">
        <div className="flex items-start gap-4">
          <Link href="/medico" className="text-gray-400 hover:text-gray-700 transition-colors mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-[#E1F5EE] rounded-full flex items-center justify-center text-[#0F6E56] font-bold">
              {avatar}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{nombreCompleto}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />{patient.pais ?? "—"} · {patient.edad ?? "—"} años
                </div>
                {protoEdit && <ProtocoloBadge tipo={protoEdit.tipo} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab ? "bg-[#0F6E56] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── RESUMEN ── */}
        {activeTab === "Resumen" && (
          <div className="p-6 space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User, label: "Email", val: profile.email },
                { icon: MapPin, label: "País", val: patient.pais ?? "—" },
                { icon: Weight, label: "Peso actual", val: patient.peso_actual != null ? `${patient.peso_actual} kg` : "—" },
                { icon: Ruler, label: "Altura", val: patient.altura != null ? `${patient.altura} cm` : "—" },
                { icon: Target, label: "IMC", val: patient.imc != null ? patient.imc.toString() : "—" },
                { icon: CheckCircle, label: "Registro", val: patient.fecha_registro ? new Date(patient.fecha_registro).toLocaleDateString("es-ES") : "—" },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-start gap-2 p-3 bg-white rounded-xl border border-gray-100">
                  <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-900">{val}</p></div>
                </div>
              ))}
            </div>

            {patient.medicamentos_actuales && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Medicación actual</p>
                <p className="text-sm text-gray-800">{patient.medicamentos_actuales}</p>
              </div>
            )}

            {patient.frustracion_principal && (
              <div className="bg-[#FAEEDA] rounded-2xl p-5">
                <p className="text-xs font-bold text-[#a86a00] uppercase tracking-wide mb-2">Frustración principal</p>
                <p className="text-sm text-[#a86a00]/90 italic">&ldquo;{patient.frustracion_principal}&rdquo;</p>
              </div>
            )}

            {patient.sintomas.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Síntomas reportados</p>
                <div className="flex flex-wrap gap-2">
                  {patient.sintomas.map((s) => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {(patient.energia != null || patient.sueno != null || patient.libido != null) && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Energía", val: patient.energia, color: "text-[#0F6E56]", bg: "bg-[#E1F5EE]" },
                  { label: "Sueño", val: patient.sueno, color: "text-[#185FA5]", bg: "bg-[#E6F1FB]" },
                  { label: "Libido", val: patient.libido, color: "text-[#993556]", bg: "bg-pink-50" },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-black ${color}`}>{val ?? "—"}</p>
                    <p className={`text-xs ${color}/70`}>{label}/10</p>
                  </div>
                ))}
              </div>
            )}

            {patient.objetivos_3_meses && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Objetivo a 3 meses</p>
                <p className="text-sm text-gray-800">{patient.objetivos_3_meses}</p>
              </div>
            )}

            {patient.resultado_ideal && (
              <div className="bg-[#E1F5EE] rounded-2xl p-5">
                <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-wide mb-2">Resultado ideal</p>
                <p className="text-sm text-[#0F6E56]/90 italic">&ldquo;{patient.resultado_ideal}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* ── PROTOCOLO ── */}
        {activeTab === "Protocolo" && (
          <div className="p-6 space-y-5 max-w-2xl">
            {!protoEdit ? (
              <div className="text-center py-12 text-gray-400">
                <p className="mb-2">Este paciente aún no tiene protocolo asignado.</p>
                <button
                  onClick={() => {
                    const newProto: ProtocolData = {
                      id: "",
                      patient_id: id,
                      titulo: "Nuevo Protocolo",
                      tipo: "Suplementación",
                      resumen_caso: "",
                      diagnostico: "",
                      plan_medicacion: "",
                      plan_nutricion: "",
                      plan_suplementacion: [],
                      plan_ejercicio: "",
                      plan_seguimiento: "",
                      que_esperar: "",
                      que_evitar: "",
                      senales_alerta: "",
                      proxima_revision: "",
                      version: 1,
                    };
                    setProtoEdit(newProto);
                  }}
                  className="text-[#0F6E56] font-semibold hover:underline text-sm"
                >
                  + Crear protocolo
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-bold text-gray-900">{protoEdit.titulo}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <ProtocoloBadge tipo={protoEdit.tipo} size="sm" />
                      <span className="text-xs text-gray-400">v{protoEdit.version}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveProtocol} disabled={saving}
                      className="flex items-center gap-1.5 bg-[#0F6E56] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#0d5e49] transition-all disabled:opacity-60">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                    </button>
                    <button onClick={notifyPatient}
                      className="flex items-center gap-1.5 bg-[#E1F5EE] text-[#0F6E56] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#d0edde] transition-all border border-[#5DCAA5]">
                      <Bell className="w-4 h-4" /> Notificar
                    </button>
                  </div>
                </div>

                {/* Titulo y tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Título</label>
                    <input
                      value={protoEdit.titulo}
                      onChange={(e) => setProtoEdit({ ...protoEdit, titulo: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tipo</label>
                    <select
                      value={protoEdit.tipo}
                      onChange={(e) => setProtoEdit({ ...protoEdit, tipo: e.target.value as ProtocolTipo })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] bg-white"
                    >
                      {(["GLP-1", "TRT", "Hormonal Femenino", "Suplementación"] as ProtocolTipo[]).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Text fields */}
                {[
                  { label: "Resumen del caso", field: "resumen_caso" as const },
                  { label: "Diagnóstico", field: "diagnostico" as const },
                  { label: "Medicación", field: "plan_medicacion" as const },
                  { label: "Nutrición", field: "plan_nutricion" as const },
                  { label: "Ejercicio", field: "plan_ejercicio" as const },
                  { label: "Seguimiento", field: "plan_seguimiento" as const },
                  { label: "Qué esperar", field: "que_esperar" as const },
                  { label: "Qué evitar", field: "que_evitar" as const },
                  { label: "Señales de alerta", field: "senales_alerta" as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                    <textarea
                      value={protoEdit[field] ?? ""}
                      onChange={(e) => setProtoEdit({ ...protoEdit, [field]: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none"
                    />
                  </div>
                ))}

                {/* Suplementación */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Suplementación</label>
                  {protoEdit.plan_suplementacion.map((s, i) => (
                    <input key={i} value={s}
                      onChange={(e) => {
                        const next = [...protoEdit.plan_suplementacion];
                        next[i] = e.target.value;
                        setProtoEdit({ ...protoEdit, plan_suplementacion: next });
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] mb-2" />
                  ))}
                  <button
                    type="button"
                    onClick={() => setProtoEdit({ ...protoEdit, plan_suplementacion: [...protoEdit.plan_suplementacion, ""] })}
                    className="text-xs text-[#0F6E56] hover:underline"
                  >
                    + Añadir suplemento
                  </button>
                </div>

                {/* Proxima revisión y versión */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Próxima revisión</label>
                    <input type="date" value={protoEdit.proxima_revision ?? ""}
                      onChange={(e) => setProtoEdit({ ...protoEdit, proxima_revision: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Versión</label>
                    <input type="number" value={protoEdit.version}
                      onChange={(e) => setProtoEdit({ ...protoEdit, version: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={saveProtocol} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0F6E56] text-white font-bold py-3.5 rounded-2xl hover:bg-[#0d5e49] transition-all disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar cambios
                  </button>
                  <button onClick={notifyPatient}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-[#0F6E56] text-[#0F6E56] font-bold py-3.5 rounded-2xl hover:bg-[#E1F5EE] transition-all">
                    <Bell className="w-4 h-4" /> Notificar al paciente
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MENSAJES ── */}
        {activeTab === "Mensajes" && (
          <div className="flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-10">No hay mensajes aún. Inicia la conversación.</p>
              )}
              {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={`Escribe a ${profile.nombre}...`}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                <button type="submit" disabled={!input.trim()}
                  className="w-11 h-11 bg-[#0F6E56] text-white rounded-xl flex items-center justify-center hover:bg-[#0d5e49] transition-all disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── LABORATORIO ── */}
        {activeTab === "Laboratorio" && (
          <div className="p-6 space-y-4 max-w-2xl">
            <h3 className="font-bold text-gray-900">Análisis de {profile.nombre}</h3>
            {labFiles.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">El paciente aún no ha subido análisis</p>
            ) : (
              <div className="space-y-3">
                {labFiles.map((f) => (
                  <LabFileItem key={f.id} file={f} showMarkButton onMarkReviewed={markReviewed} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESO ── */}
        {activeTab === "Progreso" && (
          <div className="p-6 space-y-5 max-w-2xl">
            <h3 className="font-bold text-gray-900">Evolución de {profile.nombre}</h3>
            {progress.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">El paciente aún no tiene entradas de progreso</p>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Peso (kg)</p>
                  <ProgressChart data={progress} metric="peso" />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Bienestar general</p>
                  <ProgressChart data={progress} metric="all" />
                </div>
                <div className="space-y-3">
                  {[...progress].reverse().map((entry) => (
                    <div key={entry.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-900">{entry.mes}</span>
                        <span className="text-sm font-bold text-[#0F6E56]">{entry.peso} kg</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {[
                          { l: "Energía", v: entry.energia, c: "text-[#0F6E56]" },
                          { l: "Sueño", v: entry.sueno, c: "text-[#185FA5]" },
                          { l: "Libido", v: entry.libido, c: "text-[#993556]" },
                        ].map(({ l, v, c }) => (
                          <div key={l} className="text-center bg-gray-50 rounded-lg py-2">
                            <p className={`font-black ${c}`}>{v}</p>
                            <p className="text-xs text-gray-400">{l}</p>
                          </div>
                        ))}
                      </div>
                      {entry.notas && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{entry.notas}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
