"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";

interface WhatsAppFabProps {
  phone: string;
  message: string;
}

export function WhatsAppFab({ phone, message }: WhatsAppFabProps) {
  if (!phone) return null;

  return (
    <a
      href={buildWhatsAppUrl(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-all hover:scale-105 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
