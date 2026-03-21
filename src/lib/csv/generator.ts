import Papa from "papaparse";
import { CATEGORIES, ITEM_CONDITIONS, DELIVERY_METHODS } from "@/lib/constants";
import { Product } from "@/lib/types";
import { ValidatedRow } from "./types";

const CSV_HEADERS = [
  "action",
  "id",
  "name",
  "description",
  "price",
  "category",
  "item_condition",
  "sale_status",
  "delivery_method",
  "pickup_address",
  "pickup_map_url",
];

const TEMPLATE_EXAMPLE = {
  action: "create",
  id: "(ignorado en create)",
  name: "Silla de oficina",
  description: "Silla ergonómica en excelente estado",
  price: "45.00",
  category: CATEGORIES[1],
  item_condition: "like_new",
  sale_status: "available",
  delivery_method: "both",
  pickup_address: "Av. Principal 123",
  pickup_map_url: "",
};

const TEMPLATE_NOTES = {
  action: `REQUERIDO: create | update | delete`,
  id: `Requerido para update/delete. UUID del producto`,
  name: `Requerido para create. Nombre del producto`,
  description: `Requerido para create. Descripción del producto`,
  price: `Requerido para create. Número positivo (USD)`,
  category: `Requerido para create. Opciones: ${CATEGORIES.join(" | ")}`,
  item_condition: `Requerido para create. Opciones: ${Object.keys(ITEM_CONDITIONS).join(" | ")}`,
  sale_status: `Opcional. Opciones: available | sold (default: available)`,
  delivery_method: `Opcional. Opciones: ${Object.keys(DELIVERY_METHODS).join(" | ")} (vacío = hereda config tienda)`,
  pickup_address: `Opcional. Dirección de recogida`,
  pickup_map_url: `Opcional. URL de Google Maps`,
};

export function generateTemplate(): string {
  const data = [TEMPLATE_NOTES, TEMPLATE_EXAMPLE];
  return addBom(
    Papa.unparse(data, {
      columns: CSV_HEADERS,
    })
  );
}

export function generateExportCsv(products: Product[]): string {
  const data = products.map((p) => ({
    action: "update",
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    category: p.category,
    item_condition: p.item_condition,
    sale_status: p.sale_status,
    delivery_method: p.delivery_method || "",
    pickup_address: p.pickup_address || "",
    pickup_map_url: p.pickup_map_url || "",
  }));
  return addBom(
    Papa.unparse(data, {
      columns: CSV_HEADERS,
    })
  );
}

export function generateErrorsCsv(rows: ValidatedRow[]): string {
  const errorRows = rows.filter((r) => !r.isValid);
  const data = errorRows.map((r) => ({
    ...r.raw,
    _errors: r.errors.join("; "),
  }));
  return addBom(
    Papa.unparse(data, {
      columns: [...CSV_HEADERS, "_errors"],
    })
  );
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function addBom(csv: string): string {
  return "\uFEFF" + csv;
}
