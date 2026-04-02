import Link from "next/link";
import {
  Syringe,
  Brain,
  TrendingDown,
  HelpCircle,
  ShoppingBag,
  CheckCircle,
  Clock,
  ClipboardList,
  Stethoscope,
  RefreshCw,
  BarChart2,
  Star,
  Heart,
  ArrowRight,
  MapPin,
} from "lucide-react";

const problemas = [
  { icon: Syringe, texto: "Me inyecto ozempic sola/solo porque nadie me explica qué hacer" },
  { icon: Brain, texto: "Tengo testosterona baja pero mi médico no sabe nada del tema" },
  { icon: TrendingDown, texto: "Perdí peso con semaglutida pero lo recuperé todo al dejarlo" },
  { icon: HelpCircle, texto: "Me dicen que es la edad, pero sé que algo hormonal está mal" },
  { icon: ShoppingBag, texto: "Compré suplementos sin saber si los necesito o en qué dosis" },
];

const pasos = [
  { num: "01", icon: ClipboardList, titulo: "Llenas tu formulario en 10 minutos", desc: "Por fin alguien te pregunta lo correcto: síntomas, medicación, análisis, frustraciones." },
  { num: "02", icon: Stethoscope, titulo: "Tu médico crea tu protocolo", desc: "Revisamos tu caso y te enviamos un protocolo personalizado en menos de 24 horas." },
  { num: "03", icon: RefreshCw, titulo: "Acompañamiento semanal", desc: "No desaparecemos. Ajustamos tu protocolo según tu respuesta cada semana." },
  { num: "04", icon: BarChart2, titulo: "Análisis y resultados reales", desc: "Al mes 1 revisamos tus análisis de laboratorio y medimos resultados concretos." },
];

const paraQuien = [
  { emoji: "💉", titulo: "Usuarios de GLP-1", desc: "Ozempic, Wegovy, Mounjaro — sin protocolo ni supervisión. Lo hacemos bien contigo." },
  { emoji: "💪", titulo: "TRT Masculino", desc: "Testosterona baja o TRT sin seguimiento. Optimizamos tu protocolo con análisis reales." },
  { emoji: "🌸", titulo: "Perimenopausia y menopausia", desc: "Sofocos, insomnio, humor. No es la edad — es hormonal y tiene solución." },
  { emoji: "🔬", titulo: "Optimización hormonal", desc: "Quieres entender tus análisis y optimizar tu biología. Somos tu equipo." },
];

const incluye = [
  "Protocolo médico personalizado en 24h",
  "Mensajería directa con tu médico (respuesta en <24h)",
  "Ajustes de protocolo según tu evolución",
  "Revisión de análisis de laboratorio",
  "1 videollamada mensual incluida",
  "Acceso a tu historial y progreso en la app",
];

const testimonios = [
  {
    nombre: "María González", edad: 44, pais: "México", protocolo: "GLP-1",
    texto: "Por primera vez alguien me explicó por qué me sentía tan cansada usando ozempic. El protocolo fue un antes y un después. Perdí 6 kg en 2 meses y conservé el músculo.",
    resultado: "−6 kg en 2 meses", color: "text-[#0F6E56]", bg: "bg-[#E1F5EE]",
  },
  {
    nombre: "Jorge Martínez", edad: 38, pais: "España", protocolo: "TRT",
    texto: "Llevaba 2 años diciéndole a mi médico que algo andaba mal. Aquí me dieron el protocolo correcto y en 3 meses volví a ser yo.",
    resultado: "Testosterona óptima en 10 sem.", color: "text-[#185FA5]", bg: "bg-[#E6F1FB]",
  },
  {
    nombre: "Claudia Reyes", edad: 51, pais: "Argentina", protocolo: "Menopausia",
    texto: "Un año con insomnio y sofocos y me decían 'es la edad'. En una semana con el protocolo ya dormía 6 horas seguidas.",
    resultado: "Sueño recuperado en 1 semana", color: "text-[#993556]", bg: "bg-pink-50",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0F6E56] text-lg">AcompañaMed</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="bg-[#0F6E56] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#0d5e49] transition-colors">
              Empezar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFAFA] via-white to-[#E1F5EE] pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E1F5EE] text-[#0F6E56] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#0F6E56] rounded-full animate-pulse" />
            Plataforma de acompañamiento hormonal
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Por fin un médico que te{" "}
            <span className="text-[#0F6E56]">acompaña de verdad</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            No uno que te receta y desaparece. Un médico que conoce tu caso, lee tus análisis y
            ajusta tu protocolo mientras usas GLP-1, testosterona o suplementos hormonales.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/registro" className="inline-flex items-center justify-center gap-2 bg-[#0F6E56] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg hover:shadow-[#0F6E56]/20 text-base">
              Empezar mi protocolo <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#como-funciona" className="inline-flex items-center justify-center gap-2 border-2 border-[#0F6E56] text-[#0F6E56] font-semibold px-8 py-4 rounded-2xl hover:bg-[#E1F5EE] transition-all text-base">
              Ver cómo funciona
            </a>
          </div>
          <p className="text-sm text-gray-500">
            ⚡ Respuesta en menos de 24 horas · 🌎 Disponible en toda Latinoamérica y España
          </p>
        </div>
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
          {[
            { label: "GLP-1 / Ozempic", color: "bg-[#E1F5EE] text-[#0F6E56]", icon: "💉" },
            { label: "TRT Masculino", color: "bg-[#E6F1FB] text-[#185FA5]", icon: "💪" },
            { label: "Menopausia", color: "bg-pink-50 text-[#993556]", icon: "🌸" },
          ].map((c) => (
            <div key={c.label} className={`${c.color} rounded-2xl p-5 text-center font-semibold text-sm`}>
              <div className="text-3xl mb-2">{c.icon}</div>
              {c.label}
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            ¿Te identificas con alguna de estas situaciones?
          </h2>
          <p className="text-gray-500 text-center mb-12 text-lg">Si dijiste que sí a alguna, estás en el lugar correcto.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problemas.map(({ icon: Icon, texto }, i) => (
              <div key={i} className="flex items-start gap-4 p-5 border border-gray-100 rounded-2xl hover:border-[#5DCAA5] hover:bg-[#FAFAFA] transition-all group">
                <div className="flex-shrink-0 w-10 h-10 bg-[#E1F5EE] rounded-xl flex items-center justify-center group-hover:bg-[#0F6E56] transition-colors">
                  <Icon className="w-5 h-5 text-[#0F6E56] group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">Cómo funciona AcompañaMed</h2>
          <p className="text-gray-500 text-center mb-14 text-lg">4 pasos. Sin complicaciones.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pasos.map(({ num, icon: Icon, titulo, desc }) => (
              <div key={num} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-[#E1F5EE]">{num}</span>
                  <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">¿Para quién es AcompañaMed?</h2>
          <p className="text-gray-500 text-center mb-12 text-lg">Para quienes ya no quieren esperar.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {paraQuien.map(({ emoji, titulo, desc }) => (
              <div key={titulo} className="flex items-start gap-4 p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                <div className="text-3xl flex-shrink-0">{emoji}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{titulo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIO */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0F6E56] to-[#0a5240]">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center gap-1 bg-[#FAEEDA] text-[#a86a00] text-xs font-semibold px-3 py-1 rounded-full mb-4">⭐ Plan completo</div>
            <div className="mb-1">
              <span className="text-5xl font-black text-gray-900">$127</span>
              <span className="text-gray-500 ml-2">USD / mes</span>
            </div>
            <p className="text-gray-500 text-sm mb-8">Todo incluido, sin sorpresas</p>
            <ul className="text-left space-y-3 mb-8">
              {incluye.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#0F6E56] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/registro" className="block w-full bg-[#0F6E56] text-white font-bold py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg text-center text-base">
              Empezar ahora
            </Link>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Garantía de 7 días — si no es para ti, te devolvemos el dinero
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 px-4 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">Lo que dicen nuestros pacientes</h2>
          <div className="flex justify-center gap-1 mb-12">
            {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="w-5 h-5 text-[#EF9F27] fill-[#EF9F27]" />))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div key={t.nombre} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full mb-4 ${t.bg} ${t.color}`}>{t.protocolo}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">&ldquo;{t.texto}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t.nombre}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />{t.edad} años · {t.pais}
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${t.color}`}>{t.resultado}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tu protocolo personalizado en 24 horas</h2>
          <p className="text-gray-600 mb-8 text-lg">Rellena el formulario ahora. En menos de 24 horas tienes tu plan.</p>
          <Link href="/registro" className="inline-flex items-center gap-2 bg-[#0F6E56] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#0d5e49] transition-all hover:shadow-lg text-base">
            Empezar mi protocolo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F6E56] rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold">AcompañaMed</span>
          </div>
          <p className="text-sm">© 2025 AcompañaMed. Medicina de acompañamiento hormonal.</p>
          <Link href="/login" className="text-sm hover:text-white transition-colors">Entrar a la plataforma</Link>
        </div>
      </footer>
    </div>
  );
}
