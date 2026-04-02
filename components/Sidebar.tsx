"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import {
  Home,
  FileText,
  MessageCircle,
  TrendingUp,
  FlaskConical,
  Video,
  User,
  Users,
  LogOut,
  Menu,
  X,
  Heart,
} from "lucide-react";

interface SidebarProps {
  role: "paciente" | "medico";
}

const navPaciente = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/protocolo", label: "Mi Protocolo", icon: FileText },
  { href: "/dashboard/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/dashboard/progreso", label: "Mi Progreso", icon: TrendingUp },
  { href: "/dashboard/laboratorio", label: "Laboratorio", icon: FlaskConical },
  { href: "/dashboard/videollamada", label: "Videollamada", icon: Video },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

const navMedico = [
  { href: "/medico", label: "Panel Principal", icon: Home },
  { href: "/medico/pacientes", label: "Pacientes", icon: Users },
  { href: "/medico/mensajes", label: "Mensajes", icon: MessageCircle },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = role === "paciente" ? navPaciente : navMedico;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href={role === "medico" ? "/medico" : "/dashboard"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#0F6E56] text-sm">AcompañaMed</span>
            <p className="text-xs text-gray-400 leading-none">
              {role === "medico" ? "Panel Médico" : "Mi Portal"}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard" || href === "/medico"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#E1F5EE] text-[#0F6E56]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#0F6E56]" : "text-gray-400"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <Link href={role === "medico" ? "/medico" : "/dashboard"} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0F6E56] rounded-lg flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#0F6E56] text-sm">AcompañaMed</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <aside
            className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
