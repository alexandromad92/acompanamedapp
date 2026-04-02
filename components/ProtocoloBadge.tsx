"use client";
import { getProtocoloColor, type ProtocolTipo } from "@/lib/mock-data";

interface ProtocoloBadgeProps {
  tipo: ProtocolTipo;
  size?: "sm" | "md";
}

export function ProtocoloBadge({ tipo, size = "md" }: ProtocoloBadgeProps) {
  const colors = getProtocoloColor(tipo);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${colors.bg} ${colors.text} ${colors.border} ${sizeClass}`}
    >
      {tipo}
    </span>
  );
}
