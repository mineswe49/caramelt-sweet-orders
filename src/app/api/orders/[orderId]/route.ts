import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH - Update customer details, notes, or uncancel order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { fullName, email, phone, whatsapp, notes, uncancel, updateCustomer } = body;

    const supabase = await createClient();

    // Get the order to find the customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Handle uncancel request (restore to PENDING_ADMIN_ACCEPTANCE)
    if (uncancel === true) {
      if (order.status !== "CANCELLED") {
        return NextResponse.json(
          { message: "Only cancelled orders can be uncancelled" },
          { status: 400 }
        );
      }

      const { error: uncancelError } = await supabase
        .from("orders")
        .update({ status: "PENDING_ADMIN_ACCEPTANCE" })
        .eq("id", orderId);

      if (uncancelError) {
        console.error("Error uncancelling order:", uncancelError);
        return NextResponse.json(
          { message: "Failed to restore order" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Order restored successfully" },
        { status: 200 }
      );
    }

    // Update customer information (in customers table)
    if (updateCustomer && order.user_id) {
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
          { message: "Failed to update customer information", error: customerError.message },
          { status: 500 }
        );
      }
    }

    // Update order notes if provided
    if (notes !== undefined) {
      const { error: notesError } = await supabase
        .from("orders")
        .update({ notes: notes || null })
        .eq("id", orderId);

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
      { message: "Failed to update order", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const { cancelReason } = body;

    const supabase = await createClient();

    // Verify order exists first
    const { data: existingOrder, error: checkError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (checkError || !existingOrder) {
      console.error("Order not found:", checkError);
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Don't allow cancelling already cancelled orders
    if (existingOrder.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Order is already cancelled" },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED with optional reason in admin_comment
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "CANCELLED",
        ...(cancelReason && { admin_comment: cancelReason }),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling order:", error);
      return NextResponse.json(
        { message: "Failed to cancel order", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Order cancelled successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { message: "Failed to cancel order", error: String(error) },
      { status: 500 }
    );
  }
}
