"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { StepIndicator } from "@/components/StepIndicator";
import { Heart, Upload, CheckCircle, Loader2, X } from "lucide-react";

const stepLabels = ["Básicos", "Situación", "Síntomas", "Historial", "Objetivos"];

const sintomasOpciones = [
  "Fatiga crónica", "Niebla mental", "Grasa abdominal", "Baja libido",
  "Insomnio", "Sofocos", "Cambios de humor", "Pérdida muscular",
  "Ansiedad", "Depresión leve", "Caída de cabello", "Problemas de piel",
  "Retención de agua", "Dificultad para bajar de peso",
];

const objetivos = [
  "Perder peso", "Ganar músculo", "Optimizar hormonas",
  "Mejorar energía", "Manejar menopausia", "Iniciar TRT",
  "Entender mis análisis", "Salud general",
];

export default function FormularioPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nombre: "", edad: "", pais: "", peso: "", altura: "", objetivo: "",
    medicamentos: "", supervision: "", frustracion: "",
    energia: 5, sueno: 5, libido: 5, sintomas: [] as string[],
    intentos: "", fallaron: "", condiciones: "",
    objetivo3meses: "", resultado_ideal: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  function toggleSintoma(s: string) {
    setForm((f) => ({
      ...f,
      sintomas: f.sintomas.includes(s) ? f.sintomas.filter((x) => x !== s) : [...f.sintomas, s],
    }));
  }

  async function handleNext() {
    if (step < 5) {
      setStep(step + 1);
      return;
    }

    // Último paso: guardar en Supabase
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/login");
        return;
      }

      const peso = form.peso ? parseFloat(form.peso) : null;
      const altura = form.altura ? parseInt(form.altura) : null;
      const edad = form.edad ? parseInt(form.edad) : null;
      const imc = peso && altura ? parseFloat((peso / ((altura / 100) ** 2)).toFixed(1)) : null;

      const { error } = await supabase.from("patients").upsert({
        id: user.id,
        edad,
        pais: form.pais || null,
        peso_actual: peso,
        altura,
        imc,
        medicamentos_actuales: form.medicamentos || null,
        supervision_actual: form.supervision || null,
        frustracion_principal: form.frustracion || null,
        sintomas: form.sintomas,
        energia: form.energia,
        sueno: form.sueno,
        libido: form.libido,
        intentos_anteriores: form.intentos || null,
        por_que_fallaron: form.fallaron || null,
        condiciones_medicas: form.condiciones || null,
        objetivo_principal: form.objetivo || null,
        objetivos_3_meses: form.objetivo3meses || null,
        resultado_ideal: form.resultado_ideal || null,
      });

      if (error) {
        toast.error("Error al guardar tu información: " + error.message);
        setSaving(false);
        return;
      }

      toast.success("¡Perfil médico guardado! Tu médico revisará tu caso pronto.");
      router.push("/dashboard?nuevo=1");
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado. Intenta nuevamente.");
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      return;
    }

    setUploading(true);

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("lab-files")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        toast.error(`Error subiendo ${file.name}`);
        continue;
      }

      const { error: dbError } = await supabase.from("lab_files").insert({
        patient_id: user.id,
        nombre: file.name,
        tipo: ext?.toUpperCase() ?? "Documento",
        url: path,
        estado: "Pendiente de revisión",
      });

      if (!dbError) {
        setUploadedFiles((prev) => [...prev, { name: file.name, path }]);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeUploadedFile(path: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.path !== path));
  }

  const SliderField = ({ label, field, value }: { label: string; field: string; value: number }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-sm font-bold text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-lg">{value}/10</span>
      </div>
      <input
        type="range" min="1" max="10" value={value}
        onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
        className="w-full accent-[#0F6E56]"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>1 — Muy mal</span><span>10 — Excelente</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#E1F5EE] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0F6E56]">AcompañaMed</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress */}
          <div className="p-6 border-b border-gray-100">
            <StepIndicator currentStep={step} totalSteps={5} labels={stepLabels} />
          </div>

          <div className="p-6">
            {/* PASO 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Cuéntame sobre ti</h2>
                  <p className="text-sm text-gray-500">Información básica para personalizar tu protocolo</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                    <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Tu nombre" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Edad</label>
                    <input type="number" value={form.edad} onChange={(e) => setForm({ ...form, edad: e.target.value })}
                      placeholder="años" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">País</label>
                    <select value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] bg-white">
                      <option value="">Seleccionar</option>
                      {["México", "España", "Argentina", "Colombia", "Chile", "Perú", "Venezuela", "Otro"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Peso (kg)</label>
                    <input type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })}
                      placeholder="kg" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Altura (cm)</label>
                    <input type="number" value={form.altura} onChange={(e) => setForm({ ...form, altura: e.target.value })}
                      placeholder="cm" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Objetivo principal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {objetivos.map((obj) => (
                      <button key={obj} type="button" onClick={() => setForm({ ...form, objetivo: obj })}
                        className={`text-left p-3 rounded-xl border-2 text-sm transition-all ${form.objetivo === obj ? "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56] font-medium" : "border-gray-100 hover:border-gray-200"}`}>
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Tu situación actual</h2>
                  <p className="text-sm text-gray-500">Sé honesto/a — esto nos ayuda a personalizar tu protocolo</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Qué medicamentos o suplementos tomas actualmente?</label>
                  <textarea value={form.medicamentos} onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
                    placeholder="Ej: Ozempic 0.5mg semanales, vitamina D, etc. Si no tomas nada, escribe 'ninguno'."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Tienes supervisión médica actualmente?</label>
                  <div className="space-y-2">
                    {["Sí, tengo médico especializado", "Sí, pero mi médico no conoce el tema", "No, me manejo solo/a", "Nunca he tenido supervisión"].map((op) => (
                      <label key={op} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="supervision" value={op} checked={form.supervision === op}
                          onChange={(e) => setForm({ ...form, supervision: e.target.value })} className="accent-[#0F6E56]" />
                        <span className="text-sm text-gray-700">{op}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Cuál es tu mayor frustración con tu situación actual?</label>
                  <textarea value={form.frustracion} onChange={(e) => setForm({ ...form, frustracion: e.target.value })}
                    placeholder="Ej: Me inyecto sola y nadie me explica qué hacer. Siento que algo está mal pero nadie me escucha..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Síntomas y marcadores</h2>
                  <p className="text-sm text-gray-500">Cómo te sientes hoy en una escala del 1 al 10</p>
                </div>
                <SliderField label="Nivel de energía" field="energia" value={form.energia} />
                <SliderField label="Calidad del sueño" field="sueno" value={form.sueno} />
                <SliderField label="Libido / deseo sexual" field="libido" value={form.libido} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cuáles de estos síntomas tienes? (selecciona todos los que apliquen)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sintomasOpciones.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSintoma(s)}
                        className={`text-left p-2.5 rounded-xl border-2 text-xs transition-all ${form.sintomas.includes(s) ? "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56] font-medium" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                        {form.sintomas.includes(s) ? "✓ " : ""}{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Tu historial</h2>
                  <p className="text-sm text-gray-500">Nos ayuda a entender qué has probado y por qué no funcionó</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Qué has intentado antes para mejorar tu salud hormonal?</label>
                  <textarea value={form.intentos} onChange={(e) => setForm({ ...form, intentos: e.target.value })}
                    placeholder="Dietas, suplementos, tratamientos, ejercicio, otros médicos..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Por qué crees que no funcionó o no fue suficiente?</label>
                  <textarea value={form.fallaron} onChange={(e) => setForm({ ...form, fallaron: e.target.value })}
                    placeholder="Falta de seguimiento, rebote, no veía resultados, no era personalizado..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Tienes alguna condición médica diagnosticada?</label>
                  <textarea value={form.condiciones} onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                    placeholder="Hipotiroidismo, diabetes tipo 2, hipertensión, ninguna... Sé específico/a."
                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
              </div>
            )}

            {/* PASO 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Expectativas y análisis</h2>
                  <p className="text-sm text-gray-500">¿Qué quieres lograr y qué tienes disponible?</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Qué quieres lograr en los próximos 3 meses?</label>
                  <textarea value={form.objetivo3meses} onChange={(e) => setForm({ ...form, objetivo3meses: e.target.value })}
                    placeholder="Sé específico/a: perder X kg, tener más energía, regularizar hormonas..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Cómo sería tu resultado ideal?</label>
                  <textarea value={form.resultado_ideal} onChange={(e) => setForm({ ...form, resultado_ideal: e.target.value })}
                    placeholder="No en números — ¿cómo quieres sentirte? ¿qué quieres poder hacer?"
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sube tus análisis (opcional pero muy recomendado)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#5DCAA5] hover:bg-[#E1F5EE] transition-all group disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-[#0F6E56] mx-auto mb-2 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#0F6E56] mx-auto mb-2 transition-colors" />
                    )}
                    <p className="text-sm font-medium text-gray-500 group-hover:text-[#0F6E56]">
                      {uploading ? "Subiendo..." : "Haz clic para seleccionar archivos"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG · Hemograma, hormonas, perfil metabólico</p>
                  </button>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((f) => (
                        <div key={f.path} className="border-2 border-[#0F6E56] bg-[#E1F5EE] rounded-xl p-3 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-[#0F6E56] flex-shrink-0" />
                          <p className="text-sm font-semibold text-[#0F6E56] flex-1 truncate">{f.name}</p>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(f.path)}
                            className="text-[#0F6E56]/60 hover:text-[#0F6E56] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-[#E1F5EE] rounded-2xl p-4">
                  <p className="text-sm text-[#0F6E56] font-semibold mb-1">¿Qué pasa después de enviar?</p>
                  <p className="text-xs text-[#0F6E56]/80 leading-relaxed">
                    Tu médico revisa tu formulario completo y en menos de 24 horas recibirás tu protocolo personalizado en tu dashboard. Podrás hacerle preguntas directamente.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-all">
                ← Anterior
              </button>
            )}
            <button onClick={handleNext} disabled={saving}
              className={`font-bold py-3.5 rounded-2xl transition-all hover:shadow-lg text-white disabled:opacity-60 ${
                step === 5 ? "bg-[#EF9F27] hover:bg-[#d4881f] flex-1" : "bg-[#0F6E56] hover:bg-[#0d5e49] flex-1"
              }`}>
              {saving ? "Guardando..." : step === 5 ? "Enviar y esperar mi protocolo 🚀" : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
