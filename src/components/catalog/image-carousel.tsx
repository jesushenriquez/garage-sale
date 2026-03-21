"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/lib/types";

interface ImageCarouselProps {
  images: ProductImage[];
  productName: string;
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-brand-100 rounded-lg flex items-center justify-center">
        <span className="text-brand-300">Sin imagen</span>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative">
      <div className="aspect-square relative rounded-lg overflow-hidden">
        <Image
          src={images[current].url}
          alt={`${productName} - Imagen ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-brand-800" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-brand-800" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-brand-600" : "bg-brand-200"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
