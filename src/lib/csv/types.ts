export type CsvAction = "create" | "update" | "delete";

export interface CsvRow {
  action: string;
  id?: string;
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  item_condition?: string;
  sale_status?: string;
  delivery_method?: string;
  pickup_address?: string;
  pickup_map_url?: string;
}

export interface ValidatedRow {
  rowNumber: number;
  raw: CsvRow;
  action: CsvAction | null;
  isValid: boolean;
  errors: string[];
  parsed?: {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    item_condition?: string;
    sale_status?: string;
    delivery_method?: string | null;
    pickup_address?: string | null;
    pickup_map_url?: string | null;
  };
}

export interface ImportSummary {
  total: number;
  toCreate: number;
  toUpdate: number;
  toDelete: number;
  errors: number;
  rows: ValidatedRow[];
}

export interface BulkCreateProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  item_condition: string;
  sale_status: string;
  delivery_method: string | null;
  pickup_address: string | null;
  pickup_map_url: string | null;
}

export interface BulkOperationPayload {
  creates: BulkCreateProduct[];
  updates: {
    id: string;
    fields: Record<string, unknown>;
  }[];
  deletes: string[];
}

export interface BulkOperationResult {
  created: number;
  updated: number;
  deleted: number;
  errors: { action: string; id?: string; error: string }[];
}
