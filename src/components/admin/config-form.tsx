"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DELIVERY_METHODS, BANK_ACCOUNT_TYPES, DOCUMENT_TYPES } from "@/lib/constants";
import { WelcomeImageUpload } from "@/components/admin/welcome-image-upload";
import type { StoreConfig, WelcomeImage } from "@/lib/types";

interface ConfigFormProps {
  config: StoreConfig;
  welcomeImages: WelcomeImage[];
}

export function ConfigForm({ config, welcomeImages }: ConfigFormProps) {
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
    document_type: config.document_type || "",
    document_number: config.document_number || "",
    contact_email: config.contact_email || "",
    footer_contact_text: config.footer_contact_text || "",
    footer_show_whatsapp: config.footer_show_whatsapp ?? false,
    welcome_title: config.welcome_title || "",
    welcome_message: config.welcome_message || "",
    maintenance_mode: config.maintenance_mode ?? false,
    maintenance_message: config.maintenance_message || "Estamos realizando mejoras. Volvemos pronto.",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleMaintenanceToggle = () => {
    const newValue = !formData.maintenance_mode;
    const message = newValue
      ? "¿Estás seguro de activar el modo mantenimiento? Los visitantes no podrán ver el catálogo."
      : "¿Estás seguro de desactivar el modo mantenimiento? El catálogo volverá a ser visible.";

    if (window.confirm(message)) {
      update("maintenance_mode", newValue);
    }
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
        document_type: formData.document_type || null,
        document_number: formData.document_number || null,
        contact_email: formData.contact_email || null,
        footer_contact_text: formData.footer_contact_text || null,
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
      {/* Modo Mantenimiento */}
      <div className={`rounded-xl border p-6 ${formData.maintenance_mode ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Modo Mantenimiento</h2>
          <button
            type="button"
            role="switch"
            aria-checked={formData.maintenance_mode}
            onClick={handleMaintenanceToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.maintenance_mode ? "bg-amber-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.maintenance_mode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {formData.maintenance_mode
            ? "El sitio está en mantenimiento. Los visitantes no pueden ver el catálogo."
            : "El sitio está activo. Los visitantes pueden ver el catálogo normalmente."}
        </p>
        <div>
          <label className={labelClass}>Mensaje de mantenimiento</label>
          <textarea
            value={formData.maintenance_message}
            onChange={(e) => update("maintenance_message", e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Estamos realizando mejoras. Volvemos pronto."
          />
        </div>
      </div>

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

      {/* Datos para transferencia */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos para transferencia</h2>
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
          <div>
            <label className={labelClass}>Tipo de documento</label>
            <select
              value={formData.document_type}
              onChange={(e) => update("document_type", e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar...</option>
              {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Número de documento</label>
            <input
              type="text"
              value={formData.document_number}
              onChange={(e) => update("document_number", e.target.value)}
              className={inputClass}
              placeholder="1234567890"
            />
            {formData.document_number && !formData.document_type && (
              <p className="text-xs text-red-500 mt-1">Selecciona un tipo de documento</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              className={inputClass}
              placeholder="correo@ejemplo.com"
            />
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

      {/* Nota de Bienvenida */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Nota de Bienvenida</h2>
        <p className="text-sm text-gray-500 mb-4">
          Este mensaje aparece la primera vez que alguien visita tu tienda.
        </p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Título</label>
            <input
              type="text"
              value={formData.welcome_title}
              onChange={(e) => update("welcome_title", e.target.value)}
              className={inputClass}
              placeholder="Hola, soy Vale 👋"
              maxLength={200}
            />
          </div>
          <div>
            <label className={labelClass}>Mensaje</label>
            <textarea
              value={formData.welcome_message}
              onChange={(e) => update("welcome_message", e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="Cuéntale a tus visitantes por qué estás vendiendo tus cosas..."
            />
          </div>
          <div>
            <label className={labelClass}>Imágenes</label>
            <WelcomeImageUpload images={welcomeImages} />
          </div>
        </div>
      </div>

      {/* Contacto en footer */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Contacto en footer</h2>
        <p className="text-sm text-gray-500 mb-4">
          Texto que aparece en la sección de contacto del pie de página.
        </p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Texto de contacto</label>
            <textarea
              value={formData.footer_contact_text}
              onChange={(e) => update("footer_contact_text", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Coordinamos la entrega por WhatsApp. ¡Escríbenos!"
            />
            <p className="text-xs text-gray-500 mt-1">Los saltos de línea se respetan al mostrar.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="footer_show_whatsapp"
              checked={formData.footer_show_whatsapp}
              onChange={(e) => update("footer_show_whatsapp", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="footer_show_whatsapp" className="text-sm text-gray-700">
              Mostrar botón de WhatsApp en la sección de contacto
            </label>
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
