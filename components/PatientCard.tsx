"use client";
import Link from "next/link";
import { MapPin, MessageCircle, Calendar, ChevronRight } from "lucide-react";
import { ProtocoloBadge } from "./ProtocoloBadge";
import type { Patient } from "@/lib/mock-data";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const ultimoMensaje = patient.mensajes[patient.mensajes.length - 1];
  const mensajesSinLeer = patient.mensajes.filter((m) => m.de === "paciente").length;

  return (
    <Link href={`/medico/pacientes/${patient.id}`}>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-[#5DCAA5] transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center font-bold text-sm">
            {patient.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0F6E56] transition-colors">
                  {patient.nombre} {patient.apellido}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {patient.pais} · {patient.edad} años
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0F6E56] transition-colors flex-shrink-0 mt-1" />
            </div>

            <div className="mt-2">
              <ProtocoloBadge tipo={patient.protocolo_activo.tipo} size="sm" />
            </div>

            {/* Last message */}
            {ultimoMensaje && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                <MessageCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 line-clamp-2">{ultimoMensaje.texto}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                Próx. revisión: {patient.protocolo_activo.proxima_revision}
              </div>
              {mensajesSinLeer > 0 && (
                <span className="text-xs bg-[#0F6E56] text-white px-2 py-0.5 rounded-full font-medium">
                  {mensajesSinLeer} msg
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
