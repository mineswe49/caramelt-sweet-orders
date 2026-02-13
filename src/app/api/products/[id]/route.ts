import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }
}

// PATCH update product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, image_url, is_active, price } = body;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        ...(name && { name }),
        ...(description && { description }),
        ...(image_url !== undefined && { image_url }),
        ...(is_active !== undefined && { is_active }),
        ...(price !== undefined && { price }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Deleting product: ${id}`);
    const supabase = await createClient();

    // Get product to find image URL for deletion
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Product fetch error:", fetchError);
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    console.log("Product found, image_url:", product?.image_url);

    // Check if product has any order items
    console.log("Checking for associated order items...");
    const { data: orderItems, error: itemsCheckError } = await supabase
      .from("order_items")
      .select("id", { count: "exact" })
      .eq("product_id", id);

    if (!itemsCheckError && orderItems && orderItems.length > 0) {
      console.log(`Cannot delete: Product has ${orderItems.length} order item(s)`);
      return NextResponse.json(
        {
          message: `Cannot delete product with active orders. This product has ${orderItems.length} order item(s) in the system.`,
          hasOrders: true,
        },
        { status: 400 }
      );
    }

    console.log("No associated order items found - safe to delete");

    // Delete image from storage if exists (don't fail if this fails)
    if (product?.image_url) {
      try {
        // Only try to delete if it's a Supabase URL
        if (product.image_url.includes("supabase.co")) {
          const imagePath = product.image_url.split("/").pop();
          console.log("Deleting image:", imagePath);
          if (imagePath) {
            await supabase.storage.from("caramelt").remove([imagePath]);
            console.log("Image deleted successfully");
          }
        } else {
          console.log("Skipping storage deletion - local file path:", product.image_url);
        }
      } catch (storageError) {
        // Log but don't fail - proceed with product deletion
        console.warn("Warning: Could not delete image from storage", storageError);
      }
    }

    // Delete product
    console.log("Deleting product from database...");
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      throw deleteError;
    }

    console.log("Product deleted successfully");
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    let message = "Failed to delete product";
    let errorDetail = "";

    if (error instanceof Error) {
      message = error.message;
      errorDetail = error.stack || "";
    } else if (typeof error === "object" && error !== null) {
      errorDetail = JSON.stringify(error, null, 2);
      if ("message" in error) {
        message = String((error as any).message);
      }
    } else {
      errorDetail = String(error);
    }

    console.error("Full error details:", { message, errorDetail });

    return NextResponse.json(
      { message, errorDetail },
      { status: 500 }
    );
  }
}
