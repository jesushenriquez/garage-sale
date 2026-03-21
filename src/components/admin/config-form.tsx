"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DELIVERY_METHODS, BANK_ACCOUNT_TYPES } from "@/lib/constants";
import type { StoreConfig } from "@/lib/types";

interface ConfigFormProps {
  config: StoreConfig;
}

export function ConfigForm({ config }: ConfigFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    store_name: config.store_name || "",
    whatsapp_number: config.whatsapp_number || "",
    bank_name: config.bank_name || "",
    bank_account_holder: config.bank_account_holder || "",
    bank_account_number: config.bank_account_number || "",
    bank_account_type: config.bank_account_type || "",
    delivery_method: config.delivery_method || "both",
    pickup_address: config.pickup_address || "",
    pickup_map_url: config.pickup_map_url || "",
    whatsapp_message_general: config.whatsapp_message_general || "",
    whatsapp_message_product: config.whatsapp_message_product || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        bank_account_type: formData.bank_account_type || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar");
    } else {
      setSuccess(true);
      router.refresh();
    }

    setLoading(false);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">General</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nombre de la tienda</label>
            <input
              type="text"
              value={formData.store_name}
              onChange={(e) => update("store_name", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número de WhatsApp (con código de país)</label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={(e) => update("whatsapp_number", e.target.value)}
              required
              className={inputClass}
              placeholder="593981234567"
            />
            <p className="text-xs text-gray-500 mt-1">Sin +, sin espacios. Ej: 593981234567</p>
          </div>
        </div>
      </div>

      {/* Datos bancarios */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos bancarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Banco</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => update("bank_name", e.target.value)}
              className={inputClass}
              placeholder="Banco Pichincha"
            />
          </div>
          <div>
            <label className={labelClass}>Titular de la cuenta</label>
            <input
              type="text"
              value={formData.bank_account_holder}
              onChange={(e) => update("bank_account_holder", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número de cuenta</label>
            <input
              type="text"
              value={formData.bank_account_number}
              onChange={(e) => update("bank_account_number", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tipo de cuenta</label>
            <select
              value={formData.bank_account_type}
              onChange={(e) => update("bank_account_type", e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar...</option>
              {Object.entries(BANK_ACCOUNT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Entrega */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Entrega</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Método de entrega por defecto</label>
            <select
              value={formData.delivery_method}
              onChange={(e) => update("delivery_method", e.target.value)}
              className={inputClass}
            >
              {Object.entries(DELIVERY_METHODS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Dirección / zona de recogida</label>
            <textarea
              value={formData.pickup_address}
              onChange={(e) => update("pickup_address", e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Sector norte, Av. Principal 123..."
            />
          </div>
          <div>
            <label className={labelClass}>URL de Google Maps (embed)</label>
            <input
              type="text"
              value={formData.pickup_map_url}
              onChange={(e) => update("pickup_map_url", e.target.value)}
              className={inputClass}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Ve a Google Maps → Compartir → Incorporar un mapa → Copia la URL del src del iframe.
            </p>
            {formData.pickup_map_url && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={formData.pickup_map_url}
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
        </div>
      </div>

      {/* Mensajes de WhatsApp */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mensajes de WhatsApp</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Mensaje general (botón flotante)</label>
            <textarea
              value={formData.whatsapp_message_general}
              onChange={(e) => update("whatsapp_message_general", e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Hola, vi el catálogo de El Garaje de Vale..."
            />
          </div>
          <div>
            <label className={labelClass}>Mensaje por producto</label>
            <textarea
              value={formData.whatsapp_message_product}
              onChange={(e) => update("whatsapp_message_product", e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Hola, me interesa el producto: {nombre} (${precio})"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles: {"{nombre}"}, {"{precio}"}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Configuración guardada correctamente</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
