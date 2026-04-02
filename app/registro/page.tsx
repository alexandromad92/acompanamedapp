"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { Heart, Eye, EyeOff } from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre, apellido: form.apellido } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const initials = `${form.nombre[0] ?? ""}${form.apellido[0] ?? ""}`.toUpperCase();

      await supabase.from("profiles").upsert({
        id: data.user.id,
        role: "paciente",
        nombre: form.nombre,
        apellido: form.apellido || null,
        email: form.email,
        avatar_initials: initials,
      });

      await supabase.from("patients").upsert({ id: data.user.id });

      toast.success("¡Cuenta creada! Completa tu perfil médico.");
      router.push("/registro/formulario");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#E1F5EE] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-[#0F6E56] text-xl">AcompañaMed</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0F6E56] to-[#5DCAA5] p-6 text-white text-center">
          <h1 className="text-xl font-bold mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-white/80">Tu protocolo personalizado te espera</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="María"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apellido</label>
              <input
                type="text"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                placeholder="González"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F6E56] text-white font-bold py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg mt-2 disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y continuar →"}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#0F6E56] font-semibold hover:underline">
              Iniciar sesión
            </Link>
          </p>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Al crear tu cuenta aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </form>
      </div>
    </div>
  );
}
