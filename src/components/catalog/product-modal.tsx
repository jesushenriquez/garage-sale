"use client";

import { useEffect } from "react";
import { X, Truck, MapPin, MessageCircle } from "lucide-react";
import type { Product, StoreConfig } from "@/lib/types";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import { ITEM_CONDITIONS, DELIVERY_METHODS } from "@/lib/constants";
import { ImageCarousel } from "./image-carousel";

interface ProductModalProps {
  product: Product;
  config: StoreConfig;
  onClose: () => void;
}

export function ProductModal({ product, config, onClose }: ProductModalProps) {
  const isSold = product.sale_status === "sold";
  const deliveryMethod = product.delivery_method || config.delivery_method;
  const showPickup = deliveryMethod === "pickup" || deliveryMethod === "both";
  const showDelivery = deliveryMethod === "delivery" || deliveryMethod === "both";

  const whatsappMessage = (config.whatsapp_message_product || "Hola, me interesa el producto: {nombre} (${precio})")
    .replace("{nombre}", product.name)
    .replace("{precio}", product.price.toFixed(2));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-3">
          <button
            onClick={onClose}
            className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-brand-800" />
          </button>
        </div>

        <div className="px-6 pb-6 -mt-4">
          {/* Images */}
          <ImageCarousel images={product.images || []} productName={product.name} />

          {/* Info */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-brand-800">{product.name}</h2>
              <span className="text-xl font-bold text-brand-600 shrink-0">
                {formatPrice(product.price)}
              </span>
            </div>

            {isSold && (
              <span className="inline-block bg-brand-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Vendido
              </span>
            )}

            <p className="text-sm text-brand-700 leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap gap-2">
              <span className="bg-brand-100 text-brand-600 text-xs px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <span className="bg-brand-100 text-brand-600 text-xs px-2.5 py-1 rounded-full">
                {ITEM_CONDITIONS[product.item_condition as keyof typeof ITEM_CONDITIONS]}
              </span>
            </div>

            {/* Delivery info */}
            <div className="bg-brand-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
                {showDelivery && (
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {DELIVERY_METHODS[deliveryMethod as keyof typeof DELIVERY_METHODS]}
                  </span>
                )}
                {!showDelivery && showPickup && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {DELIVERY_METHODS[deliveryMethod as keyof typeof DELIVERY_METHODS]}
                  </span>
                )}
              </div>

              {showPickup && config.pickup_address && (
                <p className="text-xs text-brand-600">{config.pickup_address}</p>
              )}

              {showPickup && config.pickup_map_url && (
                <div className="rounded-lg overflow-hidden mt-2">
                  <iframe
                    src={config.pickup_map_url}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>

            {/* WhatsApp button */}
            {!isSold && config.whatsapp_number && (
              <a
                href={buildWhatsAppUrl(config.whatsapp_number, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 text-white rounded-lg py-3 font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Preguntar por este producto
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
