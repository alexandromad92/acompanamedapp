"use client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LabFileItem } from "@/components/LabFileItem";
import { Upload, CloudUpload } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type LabFile = Database["public"]["Tables"]["lab_files"]["Row"];

export default function LaboratorioPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [files, setFiles] = useState<LabFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserId(user.id);

      const { data } = await supabase
        .from("lab_files")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      setFiles(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    uploadFiles(dropped);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    uploadFiles(selected);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  async function uploadFiles(selected: File[]) {
    if (!userId || selected.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const uploaded: LabFile[] = [];

    for (const file of selected) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${userId}/${Date.now()}_${safeName}`;

      const { error: storageError } = await supabase.storage
        .from("lab-files")
        .upload(storagePath, file);

      if (storageError) {
        toast.error(`Error al subir ${file.name}`, { description: storageError.message });
        continue;
      }

      const { data: rowData, error: dbError } = await supabase
        .from("lab_files")
        .insert({
          patient_id: userId,
          nombre: file.name,
          storage_path: storagePath,
          tipo: "Subido por paciente",
          estado: "Pendiente de revisión",
        })
        .select()
        .single();

      if (dbError) {
        toast.error(`Error al registrar ${file.name}`, { description: dbError.message });
      } else {
        uploaded.push(rowData);
      }
    }

    if (uploaded.length > 0) {
      setFiles((prev) => [...uploaded, ...prev]);
      toast.success(`${uploaded.length} archivo(s) subido(s)`, {
        description: "Tu médico lo revisará en las próximas 24 horas.",
      });
    }

    setUploading(false);
  }

  // LabFileItem expects the mock LabFile shape; adapt to DB shape
  function toLabFileShape(f: LabFile) {
    return {
      id: f.id,
      nombre: f.nombre,
      fecha: new Date(f.created_at).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }),
      estado: f.estado,
      tipo: f.tipo ?? "Análisis",
    };
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-64 bg-gray-200 rounded-2xl" /></div>;

  const reviewed = files.filter(f => f.estado === "Revisado por médico").length;
  const pending = files.filter(f => f.estado === "Pendiente de revisión").length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laboratorio</h1>
        <p className="text-gray-500 mt-1 text-sm">Sube tus análisis para que tu médico los revise</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#E1F5EE] rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-[#0F6E56]">{reviewed}</p>
          <p className="text-xs text-[#0F6E56]/70 mt-1">Revisados por médico</p>
        </div>
        <div className="bg-[#FAEEDA] rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-[#a86a00]">{pending}</p>
          <p className="text-xs text-[#a86a00]/70 mt-1">Pendientes de revisión</p>
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragging ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-gray-200 hover:border-[#5DCAA5] hover:bg-gray-50"
        } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />
        <CloudUpload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragging ? "text-[#0F6E56]" : "text-gray-300"}`} />
        {uploading ? (
          <>
            <p className="font-semibold text-gray-600 mb-1">Subiendo archivos...</p>
            <p className="text-sm text-gray-400">Por favor espera</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-600 mb-1">Arrastra tus archivos aquí</p>
            <p className="text-sm text-gray-400 mb-3">o haz clic para seleccionar</p>
            <span className="inline-flex items-center gap-1.5 bg-[#0F6E56] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <Upload className="w-4 h-4" /> Seleccionar archivos
            </span>
          </>
        )}
        <p className="text-xs text-gray-400 mt-3">PDF, JPG, PNG · Hemograma, hormonas, perfil metabólico, etc.</p>
      </div>

      {/* File list */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Mis análisis ({files.length})</h3>
        {files.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aún no has subido análisis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((f) => <LabFileItem key={f.id} file={toLabFileShape(f)} />)}
          </div>
        )}
      </div>

      <div className="bg-[#E6F1FB] rounded-2xl p-4">
        <p className="text-sm font-semibold text-[#185FA5] mb-1">¿Qué análisis subir?</p>
        <ul className="text-xs text-[#185FA5]/80 space-y-1">
          <li>• Hemograma completo</li>
          <li>• Panel hormonal (según tu protocolo)</li>
          <li>• Perfil metabólico / glucosa / insulina</li>
          <li>• Función hepática y renal</li>
          <li>• Cualquier análisis que tengas reciente</li>
        </ul>
      </div>
    </div>
  );
}
