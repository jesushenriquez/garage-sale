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
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ existing: [], missing: [] });
  }

  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ existing: [], missing: [] });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const existingIds = new Set(data.map((p) => p.id));
  const existing = ids.filter((id) => existingIds.has(id));
  const missing = ids.filter((id) => !existingIds.has(id));

  return NextResponse.json({ existing, missing });
}
