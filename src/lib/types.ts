export type ItemCondition = "new" | "like_new" | "used";
export type SaleStatus = "available" | "sold";
export type DeliveryMethod = "delivery" | "pickup" | "both";
export type BankAccountType = "savings" | "checking";
export type DocumentType = "cedula" | "ruc" | "pasaporte";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  item_condition: ItemCondition;
  sale_status: SaleStatus;
  delivery_method: DeliveryMethod | null;
  pickup_address: string | null;
  pickup_map_url: string | null;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}

export interface StoreConfig {
  id: number;
  store_name: string;
  whatsapp_number: string;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_account_type: BankAccountType | null;
  delivery_method: DeliveryMethod;
  pickup_address: string | null;
  pickup_map_url: string | null;
  whatsapp_message_general: string | null;
  whatsapp_message_product: string | null;
  document_type: DocumentType | null;
  document_number: string | null;
  contact_email: string | null;
  footer_contact_text: string | null;
  footer_show_whatsapp: boolean;
  welcome_title: string | null;
  welcome_message: string | null;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  updated_at: string;
}

export interface WelcomeImage {
  id: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}
