import { Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data: config } = await supabase
    .from("store_config")
    .select("maintenance_message, store_name")
    .eq("id", 1)
    .single();

  const message =
    config?.maintenance_message ||
    "Estamos realizando mejoras. Volvemos pronto.";

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 mb-6">
          <Wrench className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="text-2xl font-semibold text-brand-900 mb-3">
          {config?.store_name || "El Garaje de Vale"}
        </h1>
        <p className="text-brand-700 text-lg leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
