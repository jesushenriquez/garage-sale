import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Validación: si hay número de documento, debe haber tipo
  if (body.document_number && !body.document_type) {
    return NextResponse.json(
      { error: "Se requiere tipo de documento cuando se ingresa un número de documento" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("store_config")
    .update({
      store_name: body.store_name,
      whatsapp_number: body.whatsapp_number,
      bank_name: body.bank_name,
      bank_account_holder: body.bank_account_holder,
      bank_account_number: body.bank_account_number,
      bank_account_type: body.bank_account_type,
      delivery_method: body.delivery_method,
      pickup_address: body.pickup_address,
      pickup_map_url: body.pickup_map_url,
      whatsapp_message_general: body.whatsapp_message_general,
      whatsapp_message_product: body.whatsapp_message_product,
      document_type: body.document_type || null,
      document_number: body.document_number || null,
      contact_email: body.contact_email || null,
      footer_contact_text: body.footer_contact_text || null,
      footer_show_whatsapp: body.footer_show_whatsapp ?? false,
      welcome_title: body.welcome_title,
      welcome_message: body.welcome_message,
    })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
