import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH - Update order item (quantity or price)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { itemId, quantity, unitPrice } = body;

    if (!itemId) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the item belongs to this order
    const { data: item, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("id", itemId)
      .eq("order_id", orderId)
      .single();

    if (itemError || !item) {
      console.error("Item not found:", itemError);
      return NextResponse.json(
        { message: "Order item not found" },
        { status: 404 }
      );
    }

    // Validate quantity and unitPrice
    if (quantity !== undefined && (quantity < 1 || !Number.isInteger(quantity))) {
      return NextResponse.json(
        { message: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    if (unitPrice !== undefined && (unitPrice < 0 || typeof unitPrice !== "number")) {
      return NextResponse.json(
        { message: "Unit price must be a non-negative number" },
        { status: 400 }
      );
    }

    // Update the item (line_total is auto-calculated by the database)
    const { error: updateError } = await supabase
      .from("order_items")
      .update({
        ...(quantity !== undefined && { quantity }),
        ...(unitPrice !== undefined && { unit_price_snapshot: unitPrice }),
      })
      .eq("id", itemId);

    if (updateError) {
      console.error("Error updating order item:", updateError);
      return NextResponse.json(
        { message: "Failed to update order item", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Order item updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order item:", error);
    return NextResponse.json(
      { message: "Failed to update order item", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Remove order item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the item belongs to this order
    const { data: item, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("id", itemId)
      .eq("order_id", orderId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { message: "Order item not found" },
        { status: 404 }
      );
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from("order_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      console.error("Error deleting order item:", deleteError);
      return NextResponse.json(
        { message: "Failed to delete order item" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Order item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order item:", error);
    return NextResponse.json(
      { message: "Failed to delete order item" },
      { status: 500 }
    );
  }
}
