import Papa from "papaparse";
import { CATEGORIES, ITEM_CONDITIONS, SALE_STATUSES, DELIVERY_METHODS } from "@/lib/constants";
import { CsvRow, CsvAction, ValidatedRow, ImportSummary } from "./types";

const MAX_ROWS = 200;

const VALID_ACTIONS: CsvAction[] = ["create", "update", "delete"];
const VALID_CONDITIONS = Object.keys(ITEM_CONDITIONS);
const VALID_STATUSES = Object.keys(SALE_STATUSES);
const VALID_DELIVERY = Object.keys(DELIVERY_METHODS);

const REQUIRED_HEADERS = ["action"];

export function parseCsvFile(file: File): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMessages = results.errors
            .map((e) => `Fila ${e.row}: ${e.message}`)
            .join("; ");
          reject(new Error(`Error al parsear CSV: ${errorMessages}`));
          return;
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(new Error(`Error al leer archivo: ${error.message}`));
      },
    });
  });
}

function validateRow(
  row: CsvRow,
  rowNumber: number,
  existingIds: Set<string>
): ValidatedRow {
  const errors: string[] = [];
  const action = row.action?.trim().toLowerCase() as CsvAction | undefined;

  // Validate action
  if (!action || !VALID_ACTIONS.includes(action)) {
    errors.push(
      `Acción inválida: "${row.action || ""}" (debe ser create, update o delete)`
    );
    return { rowNumber, raw: row, action: null, isValid: false, errors };
  }

  // Validate ID for update/delete
  if (action === "update" || action === "delete") {
    const id = row.id?.trim();
    if (!id) {
      errors.push("Se requiere ID para actualizar o eliminar");
    } else if (!existingIds.has(id)) {
      errors.push(`ID no encontrado: ${id}`);
    }
  }

  // Validate required fields for create
  if (action === "create") {
    if (!row.name?.trim()) errors.push("Nombre es requerido");
    if (!row.description?.trim()) errors.push("Descripción es requerida");
    if (!row.price?.trim()) errors.push("Precio es requerido");
    if (!row.category?.trim()) errors.push("Categoría es requerida");
    if (!row.item_condition?.trim()) errors.push("Condición es requerida");
  }

  // Validate required fields for update (at least name to identify)
  if (action === "update") {
    const hasAnyField =
      row.name?.trim() ||
      row.description?.trim() ||
      row.price?.trim() ||
      row.category?.trim() ||
      row.item_condition?.trim() ||
      row.sale_status?.trim() ||
      row.delivery_method?.trim() ||
      row.pickup_address?.trim() ||
      row.pickup_map_url?.trim();
    if (!hasAnyField) {
      errors.push("Se requiere al menos un campo para actualizar");
    }
  }

  // Validate price
  const priceStr = row.price?.trim();
  if (priceStr) {
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      errors.push(`Precio inválido: "${priceStr}" (debe ser un número positivo)`);
    }
  }

  // Validate category
  const category = row.category?.trim();
  if (category && !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    errors.push(
      `Categoría inválida: "${category}" (opciones: ${CATEGORIES.join(", ")})`
    );
  }

  // Validate item_condition
  const condition = row.item_condition?.trim();
  if (condition && !VALID_CONDITIONS.includes(condition)) {
    errors.push(
      `Condición inválida: "${condition}" (opciones: ${VALID_CONDITIONS.join(", ")})`
    );
  }

  // Validate sale_status
  const status = row.sale_status?.trim();
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(
      `Estado inválido: "${status}" (opciones: ${VALID_STATUSES.join(", ")})`
    );
  }

  // Validate delivery_method
  const delivery = row.delivery_method?.trim();
  if (delivery && !VALID_DELIVERY.includes(delivery)) {
    errors.push(
      `Método de entrega inválido: "${delivery}" (opciones: ${VALID_DELIVERY.join(", ")})`
    );
  }

  if (errors.length > 0) {
    return { rowNumber, raw: row, action, isValid: false, errors };
  }

  // Build parsed data
  const parsed: ValidatedRow["parsed"] = {};

  if (action === "create" || action === "update") {
    if (action === "update") parsed.id = row.id!.trim();
    if (row.name?.trim()) parsed.name = row.name.trim();
    if (row.description?.trim()) parsed.description = row.description.trim();
    if (priceStr) parsed.price = parseFloat(priceStr);
    if (category) parsed.category = category;
    if (condition) parsed.item_condition = condition;
    if (status) parsed.sale_status = status;
    parsed.delivery_method = delivery || null;
    parsed.pickup_address = row.pickup_address?.trim() || null;
    parsed.pickup_map_url = row.pickup_map_url?.trim() || null;
  }

  if (action === "delete") {
    parsed.id = row.id!.trim();
  }

  return { rowNumber, raw: row, action, isValid: true, errors: [], parsed };
}

export function validateRows(
  rows: CsvRow[],
  existingIds: string[]
): ImportSummary {
  const existingIdSet = new Set(existingIds);

  // Check headers
  const firstRow = rows[0];
  if (!firstRow) {
    return {
      total: 0,
      toCreate: 0,
      toUpdate: 0,
      toDelete: 0,
      errors: 0,
      rows: [],
    };
  }

  const headers = Object.keys(firstRow);
  const missingHeaders = REQUIRED_HEADERS.filter(
    (h) => !headers.includes(h)
  );
  if (missingHeaders.length > 0) {
    return {
      total: rows.length,
      toCreate: 0,
      toUpdate: 0,
      toDelete: 0,
      errors: rows.length,
      rows: rows.map((row, i) => ({
        rowNumber: i + 2,
        raw: row,
        action: null,
        isValid: false,
        errors: [`Columnas requeridas faltantes: ${missingHeaders.join(", ")}`],
      })),
    };
  }

  // Check row limit
  if (rows.length > MAX_ROWS) {
    return {
      total: rows.length,
      toCreate: 0,
      toUpdate: 0,
      toDelete: 0,
      errors: rows.length,
      rows: [
        {
          rowNumber: 0,
          raw: {} as CsvRow,
          action: null,
          isValid: false,
          errors: [
            `El archivo tiene ${rows.length} filas. El máximo permitido es ${MAX_ROWS}.`,
          ],
        },
      ],
    };
  }

  const validatedRows = rows.map((row, i) =>
    validateRow(row, i + 2, existingIdSet)
  );

  return {
    total: validatedRows.length,
    toCreate: validatedRows.filter(
      (r) => r.isValid && r.action === "create"
    ).length,
    toUpdate: validatedRows.filter(
      (r) => r.isValid && r.action === "update"
    ).length,
    toDelete: validatedRows.filter(
      (r) => r.isValid && r.action === "delete"
    ).length,
    errors: validatedRows.filter((r) => !r.isValid).length,
    rows: validatedRows,
  };
}
