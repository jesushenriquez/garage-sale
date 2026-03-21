import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { Product, StoreConfig } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: config }] = await Promise.all([
    supabase
      .from("products")
      .select("*, images:product_images(*)")
      .order("price", { ascending: true })
      .order("position", { referencedTable: "product_images", ascending: true }),
    supabase
      .from("store_config")
      .select("*")
      .eq("id", 1)
      .single(),
  ]);

  const storeConfig = config as StoreConfig;
  const storeProducts = (products as Product[]) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header storeName={storeConfig?.store_name || "El Garaje de Vale"} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <ProductGrid products={storeProducts} config={storeConfig} />
      </main>

      {storeConfig && <Footer config={storeConfig} />}

      {storeConfig?.whatsapp_number && (
        <WhatsAppFab
          phone={storeConfig.whatsapp_number}
          message={storeConfig.whatsapp_message_general || "Hola, vi el catálogo de El Garaje de Vale y estoy interesado/a"}
        />
      )}
    </div>
  );
}
