"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, ITEM_CONDITIONS, DELIVERY_METHODS } from "@/lib/constants";
import type { Product, PickupScheduleBlock } from "@/lib/types";
import { ImageUpload } from "./image-upload";
import { PickupScheduleEditor, isScheduleValid } from "./pickup-schedule-editor";

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState(product?.category || CATEGORIES[0]);
  const [itemCondition, setItemCondition] = useState<string>(product?.item_condition || "used");
  const [deliveryMethod, setDeliveryMethod] = useState<string>(product?.delivery_method || "");
  const [pickupAddress, setPickupAddress] = useState(product?.pickup_address || "");
  const [pickupMapUrl, setPickupMapUrl] = useState(product?.pickup_map_url || "");
  const [pickupSchedule, setPickupSchedule] = useState<PickupScheduleBlock[]>(product?.pickup_schedule || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isScheduleValid(pickupSchedule)) {
      setError("Completa todos los campos de cada horario de recogida (días, hora inicio y hora fin)");
      return;
    }

    setLoading(true);

    const body = {
      name,
      description,
      price: parseFloat(price),
      category,
      item_condition: itemCondition,
      delivery_method: deliveryMethod || null,
      pickup_address: pickupAddress || null,
      pickup_map_url: pickupMapUrl || null,
      pickup_schedule: pickupSchedule.length > 0 ? pickupSchedule : null,
      ...(isEditing ? { sale_status: product.sale_status } : {}),
    };

    const url = isEditing
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar");
      setLoading(false);
      return;
    }

    const saved = await res.json();

    // If creating, redirect to edit page to add images
    if (!isEditing) {
      router.push(`/admin/products/${saved.id}/edit`);
    }

    router.refresh();
    setLoading(false);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h2>

        <div>
          <label htmlFor="name" className={labelClass}>Nombre</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className={inputClass}
            placeholder="Nombre del producto"
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className={inputClass}
            placeholder="Describe el producto..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>Precio (USD)</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>Categoría</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condition" className={labelClass}>Estado del artículo</label>
            <select
              id="condition"
              value={itemCondition}
              onChange={(e) => setItemCondition(e.target.value)}
              className={inputClass}
            >
              {Object.entries(ITEM_CONDITIONS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="delivery" className={labelClass}>Método de entrega</label>
            <select
              id="delivery"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className={inputClass}
            >
              <option value="">Usar el de la tienda</option>
              {Object.entries(DELIVERY_METHODS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {(deliveryMethod === "pickup" || deliveryMethod === "both") && (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700">
              Lugar de recogida personalizado
              <span className="font-normal text-gray-500"> (opcional, si no se configura se usa el de la tienda)</span>
            </p>
            <div>
              <label htmlFor="pickup_address" className={labelClass}>Dirección de recogida</label>
              <textarea
                id="pickup_address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Dirección específica para este producto..."
              />
            </div>
            <div>
              <label htmlFor="pickup_map_url" className={labelClass}>URL de Google Maps (embed)</label>
              <input
                id="pickup_map_url"
                type="text"
                value={pickupMapUrl}
                onChange={(e) => setPickupMapUrl(e.target.value)}
                className={inputClass}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Ve a Google Maps → Compartir → Incorporar un mapa → Copia la URL del src del iframe.
              </p>
              {pickupMapUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={pickupMapUrl}
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
            <div>
              <label className={labelClass}>
                Horario de recogida
                <span className="font-normal text-gray-500"> (opcional, si no se configura se usa el de la tienda)</span>
              </label>
              <PickupScheduleEditor
                value={pickupSchedule}
                onChange={setPickupSchedule}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {isEditing && (
        <ImageUpload productId={product.id} images={product.images || []} />
      )}
    </div>
  );
}
