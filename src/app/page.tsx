import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { ProductGrid } from "@/components/catalog/product-grid";
import { WelcomeSection } from "@/components/catalog/welcome-section";
import type { Product, StoreConfig, WelcomeImage } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: config }, { data: welcomeImages }] = await Promise.all([
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
    supabase
      .from("welcome_images")
      .select("*")
      .order("position", { ascending: true }),
  ]);

  const storeConfig = config as StoreConfig;
  const storeProducts = (products as Product[]) || [];
  const storeWelcomeImages = (welcomeImages as WelcomeImage[]) || [];

  const hasWelcome = !!(storeConfig?.welcome_title || storeConfig?.welcome_message);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        storeName={storeConfig?.store_name || "El Garaje de Vale"}
        hasWelcome={hasWelcome}
        welcomeTitle={storeConfig?.welcome_title || ""}
        welcomeMessage={storeConfig?.welcome_message || ""}
        welcomeImages={storeWelcomeImages}
      />

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

      {hasWelcome && (
        <WelcomeSection
          title={storeConfig.welcome_title || ""}
          message={storeConfig.welcome_message || ""}
          images={storeWelcomeImages}
        />
      )}
    </div>
  );
}
