import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, image_url, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      message: "Last 5 products",
      products: data,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: String(error) },
      { status: 500 }
    );
  }
}
