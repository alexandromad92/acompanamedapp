import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Mapeo de estados de MercadoPago a nuestros estados
function mapMpStatus(mpStatus: string): "active" | "trialing" | "past_due" | "canceled" | "incomplete" {
  switch (mpStatus) {
    case "authorized": return "active";
    case "pending": return "incomplete";
    case "paused": return "past_due";
    case "cancelled": return "canceled";
    default: return "incomplete";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("MP Webhook received:", JSON.stringify(body));

    const { type, data } = body;

    // Solo procesamos notificaciones de preapproval
    if (type !== "preapproval" || !data?.id) {
      return NextResponse.json({ ok: true });
    }

    // Obtener datos actualizados de MercadoPago
    const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      console.error("No se pudo obtener el preapproval de MP");
      return NextResponse.json({ ok: true });
    }

    const preapproval = await mpResponse.json();
    const admin = createAdminClient();

    // Calcular fecha de fin del período
    let periodEnd: string | null = null;
    if (preapproval.auto_recurring?.end_date) {
      periodEnd = preapproval.auto_recurring.end_date;
    } else if (preapproval.status === "authorized") {
      // Si está activo, calcular próximo mes
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      periodEnd = nextMonth.toISOString();
    }

    // Actualizar en Supabase
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: mapMpStatus(preapproval.status),
        current_period_end: periodEnd,
        mp_payer_email: preapproval.payer_email,
      })
      .eq("mp_preapproval_id", preapproval.id);

    if (error) {
      console.error("Error actualizando suscripción:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// MercadoPago también envía GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ ok: true });
}
