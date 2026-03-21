"use client";

import { useState } from "react";
import type { Product, StoreConfig } from "@/lib/types";
import { ProductCard } from "./product-card";
import { ProductModal } from "./product-modal";
import { CategoryFilter } from "./category-filter";
import { ShoppingBag } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  config: StoreConfig;
}

export function ProductGrid({ products, config }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (!showAll && p.sale_status !== "available") return false;
    return true;
  });

  return (
    <>
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        showAll={showAll}
        onToggleAll={setShowAll}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-brand-400">
          <ShoppingBag className="w-16 h-16 mb-3" />
          <p className="text-lg font-medium">No hay productos</p>
          <p className="text-sm">
            {selectedCategory
              ? "No hay productos en esta categoría"
              : "Pronto agregaremos productos"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          config={config}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
