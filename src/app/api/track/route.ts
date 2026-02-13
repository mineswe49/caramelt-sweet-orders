import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackOrderSchema } from "@/lib/validators/order";

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = trackOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { orderCode, email } = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Query order by order_code with customer info (case insensitive email check)
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(full_name, email, phone, whatsapp),
        order_items(*)
      `
      )
      .eq("order_code", orderCode);

    if (error || !orders || orders.length === 0) {
      console.error("Order not found:", error);
      return NextResponse.json(
        { message: "Order not found. Please check your order code and email." },
        { status: 404 }
      );
    }

    // Find order with matching email (case insensitive)
    const order = orders.find(
      (o) => o.customer && o.customer.email.toLowerCase() === email.toLowerCase()
    );

    if (!order) {
      return NextResponse.json(
        { message: "Order not found. Please check your order code and email." },
        { status: 404 }
      );
    }

    // Flatten customer data into order response for backward compatibility
    const response = {
      ...order,
      full_name: order.customer?.full_name,
      email: order.customer?.email,
      phone: order.customer?.phone,
      whatsapp: order.customer?.whatsapp,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in track order:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
