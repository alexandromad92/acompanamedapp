"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProtocoloBadge } from "@/components/ProtocoloBadge";
import {
  ChevronDown, ChevronUp, AlertTriangle, MessageCircle,
  Pill, Apple, Dumbbell, Calendar, Eye, Shield, CheckCircle
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Protocol = Database["public"]["Tables"]["protocols"]["Row"];

function Section({ title, icon: Icon, children, color = "text-gray-700", defaultOpen = false }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  color?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className={`font-semibold text-sm ${color}`}>{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 bg-white border-t border-gray-50">{children}</div>}
    </div>
  );
}

export default function ProtocoloPage() {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("protocols")
        .select("*")
        .eq("patient_id", user.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      setProtocol(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-32 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (!protocol) return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-[#E1F5EE] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-[#0F6E56] rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tu protocolo está en preparación</h2>
        <p className="text-gray-600 text-sm mb-6">
          Tu médico está revisando tu caso y preparará tu protocolo personalizado en menos de 24 horas.
        </p>
        <Link href="/dashboard/mensajes"
          className="inline-flex items-center gap-2 bg-[#0F6E56] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0d5e49] transition-colors">
          <MessageCircle className="w-4 h-4" />
          Enviar mensaje al médico
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{protocol.titulo}</h1>
          <span className="text-xs bg-[#FAEEDA] text-[#a86a00] font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
            v{protocol.version} · {new Date(protocol.updated_at).toLocaleDateString("es-ES")}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <ProtocoloBadge tipo={protocol.tipo} />
          {protocol.proxima_revision && (
            <span className="text-xs text-gray-500">
              Próxima revisión: {new Date(protocol.proxima_revision).toLocaleDateString("es-ES")}
            </span>
          )}
        </div>
      </div>

      {/* Resumen */}
      {protocol.resumen_caso && (
        <Section title="Resumen de tu caso" icon={Eye} defaultOpen>
          <p className="text-sm text-gray-700 leading-relaxed pt-3">{protocol.resumen_caso}</p>
        </Section>
      )}

      {/* Diagnóstico */}
      {protocol.diagnostico && (
        <Section title="Tu diagnóstico" icon={CheckCircle} color="text-[#0F6E56]" defaultOpen>
          <div className="pt-3 bg-[#E1F5EE] rounded-xl p-4 mt-2">
            <p className="text-sm text-gray-800 leading-relaxed">{protocol.diagnostico}</p>
          </div>
        </Section>
      )}

      {/* Plan */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-50">
          <h3 className="font-bold text-sm text-gray-900">Plan de acción</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {protocol.plan_medicacion && (
            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-[#185FA5]" />
                <span className="text-xs font-bold text-[#185FA5] uppercase tracking-wide">Medicación</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{protocol.plan_medicacion}</p>
            </div>
          )}
          {protocol.plan_nutricion && (
            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="w-4 h-4 text-[#EF9F27]" />
                <span className="text-xs font-bold text-[#a86a00] uppercase tracking-wide">Nutrición</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{protocol.plan_nutricion}</p>
            </div>
          )}
          {protocol.plan_suplementacion?.length > 0 && (
            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[#0F6E56]" />
                <span className="text-xs font-bold text-[#0F6E56] uppercase tracking-wide">Suplementación</span>
              </div>
              <ul className="space-y-1.5">
                {protocol.plan_suplementacion.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56] mt-2 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {protocol.plan_ejercicio && (
            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4 text-[#993556]" />
                <span className="text-xs font-bold text-[#993556] uppercase tracking-wide">Ejercicio</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{protocol.plan_ejercicio}</p>
            </div>
          )}
          {protocol.plan_seguimiento && (
            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Seguimiento</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{protocol.plan_seguimiento}</p>
            </div>
          )}
        </div>
      </div>

      {/* Qué esperar */}
      {protocol.que_esperar && (
        <Section title="Qué esperar" icon={Eye}>
          <p className="text-sm text-gray-700 leading-relaxed pt-3 whitespace-pre-line">{protocol.que_esperar}</p>
        </Section>
      )}

      {/* Qué evitar */}
      {protocol.que_evitar && (
        <Section title="Qué evitar" icon={Shield} color="text-[#a86a00]">
          <p className="text-sm text-gray-700 leading-relaxed pt-3 whitespace-pre-line">{protocol.que_evitar}</p>
        </Section>
      )}

      {/* Señales de alerta */}
      {protocol.senales_alerta && (
        <div className="border-2 border-red-100 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 bg-red-50 border-b border-red-100">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-bold text-sm text-red-700">Señales de alerta — escríbeme si tienes esto</span>
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{protocol.senales_alerta}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <Link href="/dashboard/mensajes"
        className="flex items-center justify-center gap-2 w-full bg-[#0F6E56] text-white font-bold py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg">
        <MessageCircle className="w-5 h-5" />
        Escribir al médico
      </Link>
    </div>
  );
}
