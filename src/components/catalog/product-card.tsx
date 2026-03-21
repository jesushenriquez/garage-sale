"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const mainImage = product.images?.[0];
  const isSold = product.sale_status === "sold";

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-brand-200 overflow-hidden text-left transition-all hover:shadow-md hover:-translate-y-0.5 group w-full"
    >
      <div className="relative aspect-square">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            className={`object-cover transition-transform group-hover:scale-105 ${isSold ? "opacity-50" : ""}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-brand-100 flex items-center justify-center">
            <span className="text-brand-300 text-sm">Sin imagen</span>
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-brand-800/80 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Vendido
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-brand-600/90 text-white text-xs px-2 py-0.5 rounded-full">
          {product.category}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-brand-800 text-sm truncate">{product.name}</h3>
        <p className="text-brand-600 font-bold mt-1">{formatPrice(product.price)}</p>
      </div>
    </button>
  );
}
