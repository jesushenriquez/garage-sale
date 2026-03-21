import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  let query = supabase
    .from("products")
    .select("*, images:product_images(*)")
    .order("price", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  if (status) {
    query = query.eq("sale_status", status);
  }

  const { data, error } = await query.order("position", {
    referencedTable: "product_images",
    ascending: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
