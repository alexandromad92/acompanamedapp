"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ProgressChart } from "@/components/ProgressChart";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ProgressEntry = Database["public"]["Tables"]["progress_entries"]["Row"];

export default function ProgresoPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"peso" | "all">("peso");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ peso: "", energia: 5, sueno: 5, libido: 5, notas: "" });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserId(user.id);

      const { data } = await supabase
        .from("progress_entries")
        .select("*")
        .eq("patient_id", user.id)
        .order("fecha", { ascending: true });

      setEntries(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    const supabase = createClient();

    const newEntry = {
      patient_id: userId,
      fecha: new Date().toISOString().split("T")[0],
      mes: new Date().toLocaleDateString("es", { month: "long", year: "numeric" }),
      peso: Number(form.peso),
      energia: form.energia,
      sueno: form.sueno,
      libido: form.libido,
      notas: form.notas || null,
    };

    const { data, error } = await supabase
      .from("progress_entries")
      .insert(newEntry)
      .select()
      .single();

    if (error) {
      toast.error("Error al registrar progreso", { description: error.message });
    } else {
      setEntries((prev) => [...prev, data]);
      setForm({ peso: "", energia: 5, sueno: 5, libido: 5, notas: "" });
      toast.success("Progreso registrado", { description: "Tu médico podrá ver esta actualización." });
    }

    setSubmitting(false);
  }

  const Slider = ({ label, field, value }: { label: string; field: string; value: number }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-sm font-bold text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-lg">{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value}
        onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
        className="w-full accent-[#0F6E56]" />
    </div>
  );

  const getTrend = (current: number, prev: number, invert = false) => {
    const diff = current - prev;
    if (Math.abs(diff) < 0.1) return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    const positive = invert ? diff < 0 : diff > 0;
    return positive
      ? <TrendingUp className="w-3.5 h-3.5 text-[#0F6E56]" />
      : <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  };

  if (loading) return <div className="p-6 animate-pulse"><div className="h-64 bg-gray-200 rounded-2xl" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Progreso</h1>
        <p className="text-gray-500 mt-1 text-sm">Registro mensual de tu evolución</p>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">Evolución</h3>
          <div className="flex gap-1">
            <button onClick={() => setTab("peso")} className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${tab === "peso" ? "bg-[#0F6E56] text-white" : "bg-gray-100 text-gray-500"}`}>Peso</button>
            <button onClick={() => setTab("all")} className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${tab === "all" ? "bg-[#0F6E56] text-white" : "bg-gray-100 text-gray-500"}`}>Bienestar</button>
          </div>
        </div>
        <ProgressChart data={entries} metric={tab} />
      </div>

      {/* Historial */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Historial de entradas</h3>
        {entries.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white border border-gray-100 rounded-2xl">
            <p className="text-sm">Aún no has registrado progreso</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...entries].reverse().map((entry, i) => (
              <div key={entry.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">{entry.mes}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F6E56]">{entry.peso} kg</span>
                    {i < entries.length - 1 && getTrend(entry.peso, [...entries].reverse()[i + 1]?.peso, true)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "Energía", val: entry.energia, color: "text-[#0F6E56]", bg: "bg-[#E1F5EE]" },
                    { label: "Sueño", val: entry.sueno, color: "text-[#185FA5]", bg: "bg-[#E6F1FB]" },
                    { label: "Libido", val: entry.libido, color: "text-[#993556]", bg: "bg-pink-50" },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-2 text-center`}>
                      <p className={`text-lg font-black ${color}`}>{val}</p>
                      <p className={`text-xs ${color}/70`}>{label}</p>
                    </div>
                  ))}
                </div>
                {entry.notas && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 leading-relaxed">{entry.notas}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario nuevo registro */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#E1F5EE] border-b border-[#5DCAA5]/30">
          <h3 className="font-bold text-[#0F6E56] text-sm">Registrar este mes</h3>
          <p className="text-xs text-[#0F6E56]/70 mt-0.5">Tu médico verá esta actualización</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Peso actual (kg)</label>
            <input type="number" step="0.1" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })}
              placeholder="Ej: 74.5" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" required />
          </div>
          <Slider label="Nivel de energía" field="energia" value={form.energia} />
          <Slider label="Calidad del sueño" field="sueno" value={form.sueno} />
          <Slider label="Libido" field="libido" value={form.libido} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas del mes</label>
            <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="¿Cómo te sentiste este mes? ¿Algo destacable?"
              rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-[#0F6E56] text-white font-bold py-3.5 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? "Guardando..." : "Registrar este mes ✓"}
          </button>
        </form>
      </div>
    </div>
  );
}
