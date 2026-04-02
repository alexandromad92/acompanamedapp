"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos"
        : error.message
      );
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      toast.success("¡Bienvenido de vuelta!");
      router.refresh();
      if (profile?.role === "medico") {
        router.push("/medico");
      } else {
        router.push("/dashboard");
      }
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
          <h1 className="text-xl font-bold mb-1">Bienvenido de vuelta</h1>
          <p className="text-sm text-white/80">Ingresa a tu cuenta de AcompañaMed</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F6E56] text-white font-bold py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg mt-2 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar →"}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-[#0F6E56] font-semibold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>

      <Link href="/" className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Volver al inicio
      </Link>
    </div>
  );
}
