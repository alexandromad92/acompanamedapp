"use client";
import { FileText, CheckCircle, Clock } from "lucide-react";
import type { LabFile } from "@/lib/mock-data";

interface LabFileItemProps {
  file: LabFile;
  onMarkReviewed?: (id: string) => void;
  showMarkButton?: boolean;
}

export function LabFileItem({ file, onMarkReviewed, showMarkButton }: LabFileItemProps) {
  const isReviewed = file.estado === "Revisado por médico";

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-10 h-10 bg-[#E6F1FB] rounded-lg flex items-center justify-center">
        <FileText className="w-5 h-5 text-[#185FA5]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{file.nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {file.tipo} · Subido el {file.fecha}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {isReviewed ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F6E56] bg-[#E1F5EE] px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Revisado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a86a00] bg-[#FAEEDA] px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        )}
        {showMarkButton && !isReviewed && onMarkReviewed && (
          <button
            onClick={() => onMarkReviewed(file.id)}
            className="text-xs text-[#185FA5] hover:text-[#0F6E56] font-medium underline transition-colors"
          >
            Marcar revisado
          </button>
        )}
      </div>
    </div>
  );
}
