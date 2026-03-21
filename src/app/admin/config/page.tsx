import { createClient } from "@/lib/supabase/server";
import { ConfigForm } from "@/components/admin/config-form";
import type { StoreConfig } from "@/lib/types";

export default async function ConfigPage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("store_config")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Configuración de la tienda</h1>
      <ConfigForm config={config as StoreConfig} />
    </div>
  );
}
