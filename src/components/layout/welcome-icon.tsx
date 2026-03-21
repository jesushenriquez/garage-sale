"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircleHeart } from "lucide-react";
import { WelcomeModal } from "@/components/catalog/welcome-modal";
import type { WelcomeImage } from "@/lib/types";

interface WelcomeIconProps {
  title: string;
  message: string;
  images: WelcomeImage[];
}

export function WelcomeIcon({ title, message, images }: WelcomeIconProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-brand-500 hover:text-brand-700 transition-colors"
        aria-label="Nota de Vale"
        title="Nota de Vale"
      >
        <MessageCircleHeart className="w-5 h-5" />
      </button>

      {open && createPortal(
        <WelcomeModal
          title={title}
          message={message}
          images={images}
          forceOpen
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
