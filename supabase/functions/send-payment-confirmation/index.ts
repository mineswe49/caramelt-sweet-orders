import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OrderItem {
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(full_name, email),
        order_items (
          product_name_snapshot,
          unit_price_snapshot,
          quantity,
          line_total
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order || !order.customer) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customer = order.customer as { full_name: string; email: string };

    const total = order.order_items.reduce(
      (sum: number, item: OrderItem) => sum + Number(item.line_total),
      0
    );

    const prepDate = order.confirmed_prep_date || order.requested_prep_date;
    const formattedDate = new Date(prepDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const itemsHtml = order.order_items
      .map(
        (item: OrderItem) =>
          `<tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0e6e0; color: #333;">${item.product_name_snapshot}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0e6e0; text-align: center; color: #666;">${item.quantity}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0e6e0; text-align: right; color: #333;">EGP ${Number(item.unit_price_snapshot).toFixed(2)}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0e6e0; text-align: right; color: #333; font-weight: 500;">EGP ${Number(item.line_total).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background-color: #FFFBF8; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; color: #EB7333; margin: 0 0 4px; font-weight: 700;">Caramelt</h1>
      <p style="color: #999; margin: 0; font-size: 13px; font-style: italic;">A Swirl of Caramel, A Heart of Chocolate</p>
    </div>

    <!-- Success Banner -->
    <div style="background: linear-gradient(135deg, #EB7333, #E73B6C); padding: 28px; border-radius: 20px; text-align: center; margin-bottom: 28px;">
      <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px;">&#10003;</span>
      </div>
      <h2 style="color: white; margin: 0 0 8px; font-size: 22px; font-weight: 600;">Payment Confirmed!</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px;">Order <strong>${order.order_code}</strong></p>
    </div>

    <!-- Greeting -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
      <p style="margin: 0 0 12px; color: #333; font-size: 15px;">Hi ${customer.full_name},</p>
      <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
        Great news! Your payment has been confirmed and your order is being prepared with care.
      </p>
    </div>

    <!-- Order Items -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
      <h3 style="margin: 0 0 16px; color: #333; font-size: 16px; font-weight: 600;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f0e6e0;">Item</th>
            <th style="padding: 8px; text-align: center; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f0e6e0;">Qty</th>
            <th style="padding: 8px; text-align: right; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f0e6e0;">Price</th>
            <th style="padding: 8px; text-align: right; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f0e6e0;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 16px 8px 8px; font-weight: 700; color: #333; font-size: 16px;">Total</td>
            <td style="padding: 16px 8px 8px; text-align: right; font-weight: 700; color: #EB7333; font-size: 16px;">EGP ${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Preparation Date -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <div style="width: 40px; height: 40px; background: #FFF3ED; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 18px;">&#128197;</span>
        </div>
        <div>
          <p style="margin: 0 0 4px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Preparation Date</p>
          <p style="margin: 0; color: #333; font-size: 17px; font-weight: 600;">${formattedDate}</p>
        </div>
      </div>
    </div>

    ${
      order.admin_comment
        ? `
    <!-- Admin Comment -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <div style="width: 40px; height: 40px; background: #FFF3ED; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 18px;">&#128172;</span>
        </div>
        <div>
          <p style="margin: 0 0 4px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Note from Caramelt</p>
          <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.5;">${order.admin_comment}</p>
        </div>
      </div>
    </div>
    `
        : ""
    }

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f0e6e0;">
      <p style="color: #999; font-size: 13px; margin: 0 0 8px;">Thank you for choosing Caramelt!</p>
      <p style="color: #bbb; font-size: 12px; margin: 0;">If you have any questions, feel free to reach out.</p>
    </div>
  </div>
</body>
</html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Caramelt <onboarding@resend.dev>",
        to: customer.email,
        subject: `Payment Confirmed - Order ${order.order_code}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailData }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
