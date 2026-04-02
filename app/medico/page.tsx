import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, MessageCircle, Calendar, ChevronRight, Users, Video, TrendingUp, Stethoscope } from "lucide-react";

export default async function MedicoDashboard() {
  const supabase = await createClient();

  // Fetch all patients with profiles
  const { data: patients } = await supabase
    .from("patients")
    .select("*, profiles!inner(nombre, apellido, email, avatar_initials)")
    .order("fecha_registro", { ascending: false });

  const patientList = patients ?? [];

  // Fetch counts for stats
  const { count: totalPatients } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true });

  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender", "paciente")
    .is("read_at", null);

  // Fetch protocols for upcoming revisions
  const { data: upcomingProtocols } = await supabase
    .from("protocols")
    .select("patient_id, proxima_revision, titulo, tipo")
    .not("proxima_revision", "is", null)
    .order("proxima_revision", { ascending: true })
    .limit(10);

  const stats = [
    { icon: Users, label: "Pacientes activos", value: totalPatients ?? 0, color: "text-[#0F6E56]", bg: "bg-[#E1F5EE]" },
    { icon: MessageCircle, label: "Mensajes sin leer", value: unreadMessages ?? 0, color: "text-[#EF9F27]", bg: "bg-[#FAEEDA]" },
    { icon: Video, label: "Videollamadas pendientes", value: 0, color: "text-[#185FA5]", bg: "bg-[#E6F1FB]" },
    { icon: TrendingUp, label: "Revisiones esta semana", value: (upcomingProtocols ?? []).length, color: "text-[#993556]", bg: "bg-pink-50" },
  ];

  // Build a map from patient_id -> patient name for the revisions list
  const patientMap: Record<string, { nombre: string; apellido: string | null; avatar: string }> = {};
  for (const p of patientList) {
    const profile = (p as unknown as { profiles: { nombre: string; apellido: string | null; avatar_initials: string | null } }).profiles;
    patientMap[p.id] = {
      nombre: profile.nombre,
      apellido: profile.apellido,
      avatar: profile.avatar_initials ?? profile.nombre.slice(0, 2).toUpperCase(),
    };
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#0F6E56] rounded-xl flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Médico</h1>
          <p className="text-gray-500 text-sm">Medicina Funcional y Endocrinología</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Alerta mensajes sin leer */}
      {(unreadMessages ?? 0) > 0 && (
        <div className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-2xl p-4 flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-[#a86a00] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#a86a00]">
              {unreadMessages} mensaje(s) de pacientes esperando respuesta
            </p>
            <p className="text-xs text-[#a86a00]/70">Revisa la bandeja de mensajes de cada paciente</p>
          </div>
        </div>
      )}

      {/* Próximas revisiones */}
      {(upcomingProtocols ?? []).length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Próximas revisiones</h3>
          <div className="space-y-2">
            {(upcomingProtocols ?? []).map((proto) => {
              const patient = patientMap[proto.patient_id];
              if (!patient) return null;
              return (
                <Link key={proto.patient_id} href={`/medico/pacientes/${proto.patient_id}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-[#E1F5EE] transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#E1F5EE] rounded-full flex items-center justify-center text-xs font-bold text-[#0F6E56]">
                        {patient.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{patient.nombre} {patient.apellido}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100">
                      {proto.proxima_revision}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de pacientes */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Pacientes activos</h3>
        {patientList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay pacientes registrados aún</p>
            <p className="text-gray-400 text-sm mt-1">Los pacientes aparecerán aquí cuando completen su registro</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientList.map((p) => {
              const profile = (p as unknown as { profiles: { nombre: string; apellido: string | null; email: string; avatar_initials: string | null } }).profiles;
              const avatar = profile.avatar_initials ?? profile.nombre.slice(0, 2).toUpperCase();
              return (
                <Link key={p.id} href={`/medico/pacientes/${p.id}`}>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-[#5DCAA5] transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center font-bold text-sm">
                        {avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#0F6E56] transition-colors">
                              {profile.nombre} {profile.apellido}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {p.pais ?? "—"} · {p.edad ?? "—"} años
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0F6E56] transition-colors flex-shrink-0 mt-1" />
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            Registrado: {p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString("es-ES") : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
