import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPatientProtocol } from "@/lib/queries/protocols";
import { getLastMessage, getUnreadCount } from "@/lib/queries/messages";
import { getSubscription } from "@/lib/queries/subscriptions";
import { ProtocoloBadge } from "@/components/ProtocoloBadge";
import {
  Calendar, MessageCircle, FileText, AlertCircle, CheckCircle2,
  Dumbbell, Pill, Zap, Upload, CreditCard
} from "lucide-react";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; suscripcion?: string }>;
}) {
  const params = await searchParams;
  const isNew = params.nuevo === "1";
  const subOk = params.suscripcion === "ok";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const protocol = await getPatientProtocol(user.id);
  const lastMessage = await getLastMessage(user.id);
  const unread = await getUnreadCount(user.id, "medico");
  const subscription = await getSubscription(user.id);

  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";

  const getTodayReminder = (tipo?: string) => {
    if (tipo === "GLP-1") return {
      icon: Pill, color: "text-[#0F6E56]", bg: "bg-[#E1F5EE]",
      items: [
        "💧 Bebe 2 litros de agua",
        "🥩 Incluye proteína en cada comida (objetivo: 100g)",
        "🏋️ ¿Toca sesión de fuerza hoy?",
        "💊 Magnesio glicinato antes de dormir",
      ]
    };
    if (tipo === "TRT") return {
      icon: Dumbbell, color: "text-[#185FA5]", bg: "bg-[#E6F1FB]",
      items: [
        "💪 Día de entrenamiento de fuerza",
        "🥩 Proteína: 1.8-2g por kg de peso",
        "💊 Vitamina D3 con la comida",
        "🚫 Evita el alcohol esta semana",
      ]
    };
    return {
      icon: Zap, color: "text-[#993556]", bg: "bg-pink-50",
      items: [
        "💊 Magnesio antes de dormir",
        "🏋️ Sesión de fuerza programada",
        "🚫 Cafeína solo antes del mediodía",
        "😴 Mantén horario de sueño consistente",
      ]
    };
  };

  const reminder = getTodayReminder(protocol?.tipo);
  const ReminderIcon = reminder.icon;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Banners */}
      {isNew && (
        <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0F6E56] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">¡Formulario enviado con éxito!</p>
            <p className="text-xs text-[#0F6E56]/80 mt-0.5">
              Tu médico revisará tu caso y tendrás tu protocolo personalizado en menos de 24 horas.
            </p>
          </div>
        </div>
      )}

      {subOk && (
        <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0F6E56] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">¡Suscripción activada!</p>
            <p className="text-xs text-[#0F6E56]/80 mt-0.5">
              Bienvenido/a a AcompañaMed. Tu médico ya fue notificado.
            </p>
          </div>
        </div>
      )}

      {/* Banner de suscripción si no tiene */}
      {!hasActiveSubscription && (
        <div className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-[#a86a00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#a86a00]">Activa tu suscripción</p>
              <p className="text-xs text-[#a86a00]/80 mt-0.5">
                Para recibir tu protocolo personalizado necesitas activar el plan mensual.
              </p>
            </div>
          </div>
          <Link href="/checkout"
            className="bg-[#EF9F27] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#d4881f] transition-colors flex-shrink-0">
            Activar
          </Link>
        </div>
      )}

      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola {profile?.nombre ?? "Paciente"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {protocol ? "Tu médico está al tanto de tu caso" : "Tu médico revisará tu caso pronto"}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#0F6E56]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Protocolo</span>
          </div>
          {protocol ? (
            <>
              <ProtocoloBadge tipo={protocol.tipo} size="sm" />
              <p className="text-xs text-gray-400 mt-2">v{protocol.version} · Activo</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Pendiente de asignación</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#185FA5]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Próxima revisión</span>
          </div>
          <p className="text-base font-bold text-gray-900">
            {protocol?.proxima_revision
              ? new Date(protocol.proxima_revision).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
              : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Revisión mensual</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-[#EF9F27]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensajes</span>
          </div>
          <p className="text-base font-bold text-gray-900">{unread > 0 ? `${unread} sin leer` : "Sin pendientes"}</p>
          <p className="text-xs text-gray-400 mt-1">Del médico</p>
        </div>
      </div>

      {/* Recordatorio del día */}
      <div className={`${reminder.bg} rounded-2xl p-5 border border-gray-100`}>
        <div className="flex items-center gap-2 mb-3">
          <ReminderIcon className={`w-5 h-5 ${reminder.color}`} />
          <h3 className={`font-bold text-sm ${reminder.color}`}>Recordatorio de hoy</h3>
        </div>
        <ul className="space-y-1.5">
          {reminder.items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      </div>

      {/* Último mensaje del médico */}
      {lastMessage && lastMessage.sender === "medico" && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F6E56] rounded-full flex items-center justify-center text-xs font-bold text-white">Dr</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Tu médico</p>
                <p className="text-xs text-gray-400">AcompañaMed</p>
              </div>
            </div>
            <Link href="/dashboard/mensajes" className="text-xs text-[#0F6E56] font-semibold hover:underline">
              Ver chat →
            </Link>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
            &ldquo;{lastMessage.texto}&rdquo;
          </p>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/protocolo"
          className="bg-[#0F6E56] text-white rounded-2xl p-4 hover:bg-[#0d5e49] transition-all hover:shadow-lg">
          <FileText className="w-6 h-6 mb-2" />
          <p className="font-bold text-sm">Ver mi protocolo</p>
          <p className="text-xs text-white/70 mt-0.5">Plan personalizado</p>
        </Link>
        <Link href="/dashboard/mensajes"
          className="bg-[#E1F5EE] text-[#0F6E56] rounded-2xl p-4 hover:bg-[#d0edde] transition-all border border-[#5DCAA5]">
          <MessageCircle className="w-6 h-6 mb-2" />
          <p className="font-bold text-sm">Escribir al médico</p>
          <p className="text-xs text-[#0F6E56]/70 mt-0.5">Responde en &lt;24h</p>
        </Link>
        <Link href="/dashboard/laboratorio"
          className="bg-[#E6F1FB] text-[#185FA5] rounded-2xl p-4 hover:bg-[#d4e8f8] transition-all border border-[#185FA5]/20">
          <Upload className="w-6 h-6 mb-2" />
          <p className="font-bold text-sm">Subir análisis</p>
          <p className="text-xs text-[#185FA5]/70 mt-0.5">PDF o imagen</p>
        </Link>
        <Link href="/dashboard/progreso"
          className="bg-[#FAEEDA] text-[#a86a00] rounded-2xl p-4 hover:bg-[#f5e3c4] transition-all border border-[#EF9F27]/30">
          <AlertCircle className="w-6 h-6 mb-2" />
          <p className="font-bold text-sm">Mi progreso</p>
          <p className="text-xs text-[#a86a00]/70 mt-0.5">Registro mensual</p>
        </Link>
      </div>
    </div>
  );
}
