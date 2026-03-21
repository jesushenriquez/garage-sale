import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Get current max position
  const { data: existing } = await supabase
    .from("welcome_images")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  let nextPosition = (existing?.[0]?.position ?? -1) + 1;

  const uploaded = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const storagePath = `welcome/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    const { data: imageRecord, error: insertError } = await supabase
      .from("welcome_images")
      .insert({
        storage_path: storagePath,
        url: urlData.publicUrl,
        position: nextPosition++,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    uploaded.push(imageRecord);
  }

  return NextResponse.json(uploaded, { status: 201 });
}
