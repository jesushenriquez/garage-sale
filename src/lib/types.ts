export type ItemCondition = "new" | "like_new" | "used";
export type SaleStatus = "available" | "sold";
export type DeliveryMethod = "delivery" | "pickup" | "both";
export type BankAccountType = "savings" | "checking";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  item_condition: ItemCondition;
  sale_status: SaleStatus;
  delivery_method: DeliveryMethod | null;
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
  welcome_title: string | null;
  welcome_message: string | null;
  updated_at: string;
}

export interface WelcomeImage {
  id: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}
