"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Video, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";

// Generate next N weekday slots starting from tomorrow
function getAvailableSlots(): string[] {
  const slots: string[] = [];
  const horarios = ["09:00 AM", "11:00 AM", "04:00 PM", "06:00 PM"];
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const d = new Date();
  d.setDate(d.getDate() + 1);

  while (slots.length < 8) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const label = `${dias[dayOfWeek]} ${d.getDate()} ${meses[d.getMonth()]}`;
      for (const h of horarios.slice(0, 2)) {
        slots.push(`${label} · ${h}`);
        if (slots.length >= 8) break;
      }
    }
    d.setDate(d.getDate() + 1);
  }

  return slots;
}

export default function VideollamadaPage() {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [notas, setNotas] = useState("");
  const [sending, setSending] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const fechasDisponibles = getAvailableSlots();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setPatientId(user.id);
    });
  }, []);

  function toggleFecha(fecha: string) {
    setSelected((prev) =>
      prev.includes(fecha)
        ? prev.filter((f) => f !== fecha)
        : prev.length < 3
        ? [...prev, fecha]
        : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || selected.length === 0) return;

    setSending(true);

    const texto = [
      "📅 Solicitud de videollamada mensual",
      "",
      "Horarios preferidos:",
      ...selected.map((f, i) => `  ${i + 1}. ${f}`),
      ...(notas.trim() ? ["", `Temas a tratar: ${notas.trim()}`] : []),
    ].join("\n");

    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      patient_id: patientId,
      sender: "paciente",
      texto,
    });

    setSending(false);

    if (error) {
      toast.error("Error al enviar la solicitud. Intenta de nuevo.");
      return;
    }

    setSent(true);
    toast.success("Solicitud enviada", {
      description: "El médico confirmará el horario en las próximas 24 horas.",
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Videollamada</h1>
        <p className="text-gray-500 mt-1 text-sm">Consulta mensual cara a cara con tu médico</p>
      </div>

      {!sent ? (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Sin videollamada programada</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tu plan incluye 1 videollamada mensual. Solicita tu cita y el médico confirmará el horario en menos de 24 horas.
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-[#0F6E56] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Solicitar videollamada mensual
              </button>
            )}
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Selecciona hasta 3 fechas preferidas
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Elige las que mejor te vengan — el médico confirmará una de ellas
                </p>
                <div className="space-y-2">
                  {fechasDisponibles.map((fecha) => (
                    <button
                      key={fecha}
                      type="button"
                      onClick={() => toggleFecha(fecha)}
                      className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                        selected.includes(fecha)
                          ? "border-[#0F6E56] bg-[#E1F5EE]"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar
                          className={`w-4 h-4 ${
                            selected.includes(fecha)
                              ? "text-[#0F6E56]"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            selected.includes(fecha)
                              ? "text-[#0F6E56]"
                              : "text-gray-700"
                          }`}
                        >
                          {fecha}
                        </span>
                      </div>
                      {selected.includes(fecha) && (
                        <span className="text-xs bg-[#0F6E56] text-white px-2 py-0.5 rounded-full font-medium">
                          #{selected.indexOf(fecha) + 1}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ¿Qué quieres tratar en esta consulta? (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Quiero revisar mis análisis y ajustar la dosis del protocolo..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={selected.length === 0 || sending}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0F6E56] text-white font-bold py-3 rounded-2xl hover:bg-[#0d5e49] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    "Enviar solicitud"
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <div className="bg-white border-2 border-[#5DCAA5] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#0F6E56]" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">¡Solicitud enviada!</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Tu solicitud fue enviada. El médico confirmará el horario en las próximas 24 horas.
            Recibirás el enlace de videollamada por mensajes.
          </p>
          <div className="bg-[#E1F5EE] rounded-xl p-3 text-left">
            <p className="text-xs font-semibold text-[#0F6E56] mb-1">
              Fechas preferidas seleccionadas:
            </p>
            {selected.map((f, i) => (
              <p key={f} className="text-xs text-[#0F6E56]/80">
                {i + 1}. {f}
              </p>
            ))}
          </div>
          <button
            onClick={() => {
              setSent(false);
              setShowForm(false);
              setSelected([]);
              setNotas("");
            }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Modificar solicitud
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-[#E6F1FB] rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#185FA5]" />
          <p className="text-sm font-semibold text-[#185FA5]">Sobre las videollamadas</p>
        </div>
        <ul className="text-xs text-[#185FA5]/80 space-y-1 ml-6">
          <li>• Duración: 30-45 minutos</li>
          <li>• Frecuencia: 1 vez por mes incluida en tu plan</li>
          <li>• Se usa Google Meet o Zoom (el médico envía el enlace por mensajes)</li>
          <li>• Trae tus análisis más recientes y tus dudas anotadas</li>
        </ul>
      </div>
    </div>
  );
}
