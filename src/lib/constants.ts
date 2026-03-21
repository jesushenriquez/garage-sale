export const CATEGORIES = [
  "Electrónica",
  "Muebles",
  "Ropa y Accesorios",
  "Hogar y Cocina",
  "Deportes",
  "Libros",
  "Juguetes",
  "Otros",
] as const;

export const ITEM_CONDITIONS = {
  new: "Nuevo",
  like_new: "Como nuevo",
  used: "Usado",
} as const;

export const SALE_STATUSES = {
  available: "Disponible",
  sold: "Vendido",
} as const;

export const DELIVERY_METHODS = {
  delivery: "Entrega a domicilio",
  pickup: "Recoger en lugar",
  both: "A domicilio o recoger en lugar",
} as const;

export const DOCUMENT_TYPES = {
  cedula: "Cédula de Identidad",
  ruc: "RUC",
  pasaporte: "Pasaporte",
} as const;

export const BANK_ACCOUNT_TYPES = {
  savings: "Ahorros",
  checking: "Corriente",
} as const;
