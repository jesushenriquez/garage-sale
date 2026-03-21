import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("id", id)
    .order("position", { referencedTable: "product_images", ascending: true })
    .single();

  if (!product) {
    notFound();
  }

  return <ProductForm product={product as Product} />;
}
