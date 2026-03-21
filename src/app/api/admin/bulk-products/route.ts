import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, ITEM_CONDITIONS, SALE_STATUSES, DELIVERY_METHODS } from "@/lib/constants";
import { BulkOperationPayload, BulkOperationResult } from "@/lib/csv/types";

const MAX_ROWS = 200;
const VALID_CONDITIONS = Object.keys(ITEM_CONDITIONS);
const VALID_STATUSES = Object.keys(SALE_STATUSES);
const VALID_DELIVERY = Object.keys(DELIVERY_METHODS);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: BulkOperationPayload = await request.json();
  const totalRows =
    payload.creates.length + payload.updates.length + payload.deletes.length;

  if (totalRows === 0) {
    return NextResponse.json({ error: "No hay operaciones" }, { status: 400 });
  }

  if (totalRows > MAX_ROWS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_ROWS} operaciones por lote` },
      { status: 400 }
    );
  }

  const result: BulkOperationResult = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: [],
  };

  // 1. DELETES first (cleanup storage + delete records)
  for (const id of payload.deletes) {
    try {
      // Fetch images for storage cleanup
      const { data: images } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", id);

      if (images && images.length > 0) {
        await supabase.storage
          .from("product-images")
          .remove(images.map((img) => img.storage_path));
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        result.errors.push({ action: "delete", id, error: error.message });
      } else {
        result.deleted++;
      }
    } catch (err) {
      result.errors.push({
        action: "delete",
        id,
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  // 2. UPDATES
  for (const update of payload.updates) {
    try {
      // Server-side validation
      const fields = update.fields as Record<string, string | number | null>;
      const category = fields.category as string | undefined;
      const itemCondition = fields.item_condition as string | undefined;
      const saleStatus = fields.sale_status as string | undefined;
      const deliveryMethod = fields.delivery_method as string | undefined;
      const price = fields.price as number | undefined;

      if (category && !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
        result.errors.push({
          action: "update",
          id: update.id,
          error: `Categoría inválida: ${category}`,
        });
        continue;
      }
      if (itemCondition && !VALID_CONDITIONS.includes(itemCondition)) {
        result.errors.push({
          action: "update",
          id: update.id,
          error: `Condición inválida: ${itemCondition}`,
        });
        continue;
      }
      if (saleStatus && !VALID_STATUSES.includes(saleStatus)) {
        result.errors.push({
          action: "update",
          id: update.id,
          error: `Estado inválido: ${saleStatus}`,
        });
        continue;
      }
      if (deliveryMethod && !VALID_DELIVERY.includes(deliveryMethod)) {
        result.errors.push({
          action: "update",
          id: update.id,
          error: `Método de entrega inválido: ${deliveryMethod}`,
        });
        continue;
      }
      if (price !== undefined && (typeof price !== "number" || price <= 0)) {
        result.errors.push({
          action: "update",
          id: update.id,
          error: `Precio inválido: ${price}`,
        });
        continue;
      }

      const { error } = await supabase
        .from("products")
        .update(fields)
        .eq("id", update.id);

      if (error) {
        result.errors.push({
          action: "update",
          id: update.id,
          error: error.message,
        });
      } else {
        result.updated++;
      }
    } catch (err) {
      result.errors.push({
        action: "update",
        id: update.id,
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  // 3. CREATES
  for (const product of payload.creates) {
    try {
      // Server-side validation
      if (!product.name || !product.description || !product.price || !product.category || !product.item_condition) {
        result.errors.push({
          action: "create",
          error: `Campos requeridos faltantes para: ${product.name || "(sin nombre)"}`,
        });
        continue;
      }
      if (!CATEGORIES.includes(product.category as (typeof CATEGORIES)[number])) {
        result.errors.push({
          action: "create",
          error: `Categoría inválida: ${product.category}`,
        });
        continue;
      }
      if (!VALID_CONDITIONS.includes(product.item_condition)) {
        result.errors.push({
          action: "create",
          error: `Condición inválida: ${product.item_condition}`,
        });
        continue;
      }
      if (product.price <= 0) {
        result.errors.push({
          action: "create",
          error: `Precio inválido para: ${product.name}`,
        });
        continue;
      }

      const { error } = await supabase.from("products").insert({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        item_condition: product.item_condition,
        sale_status: product.sale_status || "available",
        delivery_method: product.delivery_method || null,
        pickup_address: product.pickup_address || null,
        pickup_map_url: product.pickup_map_url || null,
      });

      if (error) {
        result.errors.push({ action: "create", error: error.message });
      } else {
        result.created++;
      }
    } catch (err) {
      result.errors.push({
        action: "create",
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  return NextResponse.json(result);
}
