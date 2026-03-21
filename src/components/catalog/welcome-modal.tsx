"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { WelcomeImage } from "@/lib/types";

interface WelcomeModalProps {
  title: string;
  message: string;
  images: WelcomeImage[];
  forceOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = "welcome_seen";

export function WelcomeModal({ title, message, images, forceOpen = false, onClose }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
      setClosing(false);
      return;
    }

    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setVisible(true);
      }
    } catch {
      // localStorage not available
      setVisible(true);
    }
  }, [forceOpen]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      if (!forceOpen) {
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {
          // localStorage not available
        }
      }
      onClose?.();
    }, 300);
  }, [forceOpen, onClose]);

  useEffect(() => {
    if (!visible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [visible, close]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nota de bienvenida"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Card */}
      <div
        className={`relative bg-brand-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Images */}
        {images.length > 0 && (
          <div className={images.length === 1 ? "" : "grid grid-cols-2 gap-1"}>
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative ${
                  images.length === 1
                    ? "w-full aspect-[4/3] rounded-t-2xl"
                    : index === 0 && images.length % 2 !== 0
                    ? "col-span-2 aspect-[2/1] first:rounded-tl-2xl first:rounded-tr-2xl"
                    : "aspect-square"
                } ${index === 0 ? "rounded-tl-2xl" : ""} ${
                  (images.length === 1 || (index === 0 && images.length % 2 !== 0))
                    ? "rounded-tr-2xl"
                    : index === 1
                    ? "rounded-tr-2xl"
                    : ""
                } overflow-hidden`}
              >
                <Image
                  src={image.url}
                  alt={`Imagen de bienvenida ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 512px) 100vw, 512px"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {title && (
            <h2 className="text-2xl font-bold text-brand-800 mb-4">
              {title}
            </h2>
          )}

          {message && (
            <p className="text-brand-700 leading-relaxed whitespace-pre-line mb-8">
              {message}
            </p>
          )}

          <button
            onClick={close}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            Ver productos
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
