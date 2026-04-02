"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Heart, CheckCircle, Shield, Clock } from "lucide-react";
import Link from "next/link";

const beneficios = [
  "Protocolo 100% personalizado por médico especialista",
  "Mensajería directa con tu médico (respuesta en 24h)",
  "Seguimiento mensual de progreso",
  "Revisión de análisis de laboratorio",
  "Videollamadas de seguimiento incluidas",
  "Ajustes de protocolo según evolución",
];

export default function CheckoutPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión primero");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payer_email: email || user.email }),
      });

      const data = await response.json();

      if (!response.ok || !data.init_point) {
        toast.error(data.error ?? "Error al crear suscripción");
        setLoading(false);
        return;
      }

      // Redirigir a MercadoPago
      window.location.href = data.init_point;
    } catch {
      toast.error("Error inesperado. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#E1F5EE] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[#0F6E56] text-xl">AcompañaMed</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumen del plan */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Comienza tu acompañamiento
              </h1>
              <p className="text-[#5F5E5A]">
                Acceso completo a tu protocolo personalizado y seguimiento médico continuo.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">$127</span>
                <span className="text-[#5F5E5A] mb-1">USD / mes</span>
              </div>
              <p className="text-sm text-[#5F5E5A] mb-5">Cancela cuando quieras. Sin penalidades.</p>

              <ul className="space-y-3">
                {beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0F6E56] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#5F5E5A]">
              <Shield className="w-5 h-5 text-[#0F6E56]" />
              <span>Pago seguro procesado por MercadoPago</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#5F5E5A]">
              <Clock className="w-5 h-5 text-[#0F6E56]" />
              <span>Cancela en cualquier momento desde tu cuenta</span>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Información de pago</h2>
            <p className="text-sm text-[#5F5E5A] mb-6">
              Serás redirigido a MercadoPago para completar el pago de forma segura.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email de MercadoPago (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Si difiere de tu cuenta AcompañaMed"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
                />
                <p className="text-xs text-[#5F5E5A] mt-1">
                  Si lo dejas vacío, se usará el email de tu cuenta.
                </p>
              </div>

              <div className="bg-[#E1F5EE] rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Acompañamiento mensual</span>
                  <span className="font-bold text-gray-900">$127 USD</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#5DCAA5]/30">
                  <span className="text-sm font-bold text-gray-900">Total hoy</span>
                  <span className="text-lg font-bold text-[#0F6E56]">$127 USD</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F6E56] text-white font-bold py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg disabled:opacity-60"
              >
                {loading ? "Redirigiendo a MercadoPago..." : "Suscribirme por $127/mes →"}
              </button>
            </form>

            <p className="text-xs text-center text-[#5F5E5A] mt-4">
              Al suscribirte aceptas nuestros{" "}
              <span className="text-[#0F6E56]">Términos de servicio</span>.
              Puedes cancelar en cualquier momento.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard" className="text-sm text-[#5F5E5A] hover:text-[#0F6E56]">
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
