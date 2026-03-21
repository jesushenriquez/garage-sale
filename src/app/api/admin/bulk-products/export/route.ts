import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const saleStatus = searchParams.get("sale_status");
  const category = searchParams.get("category");

  let query = supabase
    .from("products")
    .select(
      "id, name, description, price, category, item_condition, sale_status, delivery_method, pickup_address, pickup_map_url"
    )
    .order("created_at", { ascending: false });

  if (saleStatus && (saleStatus === "available" || saleStatus === "sold")) {
    query = query.eq("sale_status", saleStatus);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ products: data });
}
