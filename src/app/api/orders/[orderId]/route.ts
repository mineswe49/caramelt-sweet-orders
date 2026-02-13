import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH - Update customer details and notes
export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const { fullName, email, phone, whatsapp, notes } = body;

    const supabase = await createClient();

    // Get the order to find the customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", params.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Update customer information
    if (fullName || email || phone || whatsapp !== undefined) {
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          ...(fullName && { full_name: fullName }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(whatsapp !== undefined && { whatsapp: whatsapp || null }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.user_id);

      if (customerError) {
        console.error("Error updating customer:", customerError);
        return NextResponse.json(
          { message: "Failed to update customer information" },
          { status: 500 }
        );
      }
    }

    // Update order notes if provided
    if (notes !== undefined) {
      const { error: notesError } = await supabase
        .from("orders")
        .update({ notes: notes || null })
        .eq("id", params.orderId);

      if (notesError) {
        console.error("Error updating notes:", notesError);
        return NextResponse.json(
          { message: "Failed to update order notes" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Order updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order
export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();

    // Update order status to CANCELLED
    const { error } = await supabase
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", params.orderId);

    if (error) {
      console.error("Error cancelling order:", error);
      return NextResponse.json(
        { message: "Failed to cancel order" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Order cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { message: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
