"use client";
import type { Message } from "@/lib/mock-data";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMedico = message.de === "medico";

  return (
    <div className={`flex gap-3 ${isMedico ? "justify-start" : "justify-end"}`}>
      {isMedico && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0F6E56] text-white flex items-center justify-center text-xs font-bold">
          Dr
        </div>
      )}
      <div className={`max-w-[75%] ${isMedico ? "" : "order-first"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isMedico
              ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
              : "bg-[#0F6E56] text-white rounded-tr-sm"
          }`}
        >
          {message.texto}
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isMedico ? "text-left" : "text-right"}`}>
          {message.fecha}
        </p>
      </div>
      {!isMedico && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
          Tú
        </div>
      )}
    </div>
  );
}
