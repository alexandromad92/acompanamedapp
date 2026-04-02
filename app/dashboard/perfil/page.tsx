"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ProtocoloBadge } from "@/components/ProtocoloBadge";
import { User, MapPin, Mail, Weight, Ruler, Target, Pencil, X, Save, Loader2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Protocol = Database["public"]["Tables"]["protocols"]["Row"];

const PAISES = ["México", "España", "Argentina", "Colombia", "Chile", "Perú", "Venezuela", "Otro"];

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    pais: "",
    peso_actual: "",
    altura: "",
  });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: profileData }, { data: patientData }, { data: protocolData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("patients").select("*").eq("id", user.id).single(),
        supabase.from("protocols").select("*").eq("patient_id", user.id)
          .order("version", { ascending: false }).limit(1).maybeSingle(),
      ]);

      setProfile(profileData);
      setPatient(patientData);
      setProtocol(protocolData);
      setLoading(false);
    }

    load();
  }, []);

  function startEditing() {
    if (!profile || !patient) return;
    setEditForm({
      nombre: profile.nombre ?? "",
      apellido: profile.apellido ?? "",
      edad: patient.edad?.toString() ?? "",
      pais: patient.pais ?? "",
      peso_actual: patient.peso_actual?.toString() ?? "",
      altura: patient.altura?.toString() ?? "",
    });
    setEditing(true);
  }

  async function saveProfile() {
    if (!profile || !patient) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const nombre = editForm.nombre.trim();
    const apellido = editForm.apellido.trim() || null;
    const peso = editForm.peso_actual ? parseFloat(editForm.peso_actual) : null;
    const altura = editForm.altura ? parseInt(editForm.altura) : null;
    const edad = editForm.edad ? parseInt(editForm.edad) : null;
    const imc = peso && altura ? parseFloat((peso / ((altura / 100) ** 2)).toFixed(1)) : patient.imc;
    const avatar_initials = nombre.slice(0, 2).toUpperCase();

    const [profileResult, patientResult] = await Promise.all([
      supabase.from("profiles").update({ nombre, apellido, avatar_initials }).eq("id", user.id),
      supabase.from("patients").update({
        edad,
        pais: editForm.pais || null,
        peso_actual: peso,
        altura,
        imc,
      }).eq("id", user.id),
    ]);

    setSaving(false);

    if (profileResult.error || patientResult.error) {
      toast.error("Error al guardar los cambios");
      return;
    }

    // Update local state
    setProfile((prev) => prev ? { ...prev, nombre, apellido, avatar_initials } : prev);
    setPatient((prev) => prev ? { ...prev, edad, pais: editForm.pais || null, peso_actual: peso, altura, imc } : prev);
    setEditing(false);
    toast.success("Perfil actualizado correctamente");
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-64 bg-gray-200 rounded-2xl" /></div>;

  if (!profile) return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500 text-sm">
        No se encontraron datos de perfil.
      </div>
    </div>
  );

  const displayName = `${profile.nombre}${profile.apellido ? " " + profile.apellido : ""}`;
  const initials = profile.avatar_initials ?? profile.nombre.charAt(0).toUpperCase();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Avatar y datos básicos */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center text-[#0F6E56] font-black text-xl">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {patient?.pais && <><MapPin className="w-3.5 h-3.5" /> {patient.pais} ·</>}
              {patient?.edad && <span>{patient.edad} años</span>}
            </div>
            {protocol && (
              <div className="mt-1">
                <ProtocoloBadge tipo={protocol.tipo} size="sm" />
              </div>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail, label: "Email", val: profile.email },
              { icon: User, label: "Registrado", val: patient?.fecha_registro ? new Date(patient.fecha_registro).toLocaleDateString("es-ES") : "—" },
              { icon: Weight, label: "Peso actual", val: patient?.peso_actual ? `${patient.peso_actual} kg` : "—" },
              { icon: Ruler, label: "Altura", val: patient?.altura ? `${patient.altura} cm` : "—" },
              { icon: Target, label: "IMC", val: patient?.imc ? patient.imc.toString() : "—" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{val}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nombre</label>
                <input
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Apellido</label>
                <input
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  placeholder="Opcional"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Edad</label>
                <input
                  type="number"
                  value={editForm.edad}
                  onChange={(e) => setEditForm({ ...editForm, edad: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">País</label>
                <select
                  value={editForm.pais}
                  onChange={(e) => setEditForm({ ...editForm, pais: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] bg-white"
                >
                  <option value="">Seleccionar</option>
                  {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.peso_actual}
                  onChange={(e) => setEditForm({ ...editForm, peso_actual: e.target.value })}
                  placeholder="kg"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Altura (cm)</label>
                <input
                  type="number"
                  value={editForm.altura}
                  onChange={(e) => setEditForm({ ...editForm, altura: e.target.value })}
                  placeholder="cm"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button
                onClick={saveProfile}
                disabled={saving || !editForm.nombre.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#0F6E56] text-white font-bold py-3 rounded-2xl hover:bg-[#0d5e49] transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar cambios
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Síntomas */}
      {patient?.sintomas && patient.sintomas.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Síntomas reportados</h3>
          <div className="flex flex-wrap gap-2">
            {patient.sintomas.map((s) => (
              <span key={s} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Objetivo */}
      {patient?.objetivo_principal && (
        <div className="bg-[#E1F5EE] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-wide mb-2">Objetivo principal</p>
          <p className="text-sm text-[#0F6E56] leading-relaxed">{patient.objetivo_principal}</p>
        </div>
      )}

      {/* Frustración */}
      {patient?.frustracion_principal && (
        <div className="bg-[#FAEEDA] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#a86a00] uppercase tracking-wide mb-2">Tu frustración inicial</p>
          <p className="text-sm text-[#a86a00]/90 leading-relaxed italic">&ldquo;{patient.frustracion_principal}&rdquo;</p>
        </div>
      )}

      {/* Marcadores actuales */}
      {patient && (patient.energia !== null || patient.sueno !== null || patient.libido !== null) && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Marcadores actuales</h3>
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
        </div>
      )}

      {!editing && (
        <button
          onClick={startEditing}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-all"
        >
          <Pencil className="w-4 h-4" />
          Editar perfil
        </button>
      )}
    </div>
  );
}
