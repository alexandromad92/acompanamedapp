import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { payer_email } = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Crear preapproval en MercadoPago
    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preapproval_plan_id: undefined, // sin plan previo
        reason: "AcompañaMed — Acompañamiento hormonal personalizado",
        external_reference: user.id,
        payer_email: payer_email,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 127,
          currency_id: "USD",
        },
        back_url: `${appUrl}/dashboard?suscripcion=ok`,
        status: "pending",
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MercadoPago error:", mpData);
      return NextResponse.json({ error: "Error al crear suscripción en MercadoPago" }, { status: 500 });
    }

    // Guardar en Supabase (estado pendiente)
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("subscriptions").upsert({
      patient_id: user.id,
      mp_preapproval_id: mpData.id,
      mp_payer_email: payer_email,
      status: "incomplete",
      current_period_end: null,
    });

    return NextResponse.json({ init_point: mpData.init_point, id: mpData.id });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
