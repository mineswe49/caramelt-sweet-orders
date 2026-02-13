import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validators/order";
import { addDays, startOfDay } from "date-fns";
import { MIN_PREP_DAYS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Server-side preparation date validation
    const minDate = addDays(startOfDay(new Date()), MIN_PREP_DAYS);
    const requestedDate = new Date(data.requestedPrepDate);

    if (requestedDate < minDate) {
      return NextResponse.json(
        { message: `Preparation date must be at least ${MIN_PREP_DAYS} days from today` },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Fetch real product prices from database
    const productIds = data.items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, is_active")
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { message: "Failed to fetch product information" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: "No valid products found" },
        { status: 400 }
      );
    }

    // Verify all products exist and are active
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { message: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (!product.is_active) {
        return NextResponse.json(
          { message: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Get or create customer
    const { data: existingCustomer, error: customerFetchError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", data.email)
      .eq("phone", data.phone)
      .single();

    let customerId: string;

    if (existingCustomer) {
      // Customer exists, update if needed
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          full_name: data.fullName,
          whatsapp: data.whatsapp || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);

      if (updateError) {
        console.error("Error updating customer:", updateError);
        return NextResponse.json(
          { message: "Failed to update customer information" },
          { status: 500 }
        );
      }

      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp || null,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating customer:", createError);
        return NextResponse.json(
          { message: "Failed to create customer record" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Insert order into database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: customerId,
        requested_prep_date: data.requestedPrepDate,
        notes: data.notes || null,
        payment_method: data.paymentMethod,
        status: "PENDING_ADMIN_ACCEPTANCE",
        is_paid: false,
      })
      .select("id, order_code")
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { message: "Failed to create order" },
        { status: 500 }
      );
    }

    // Insert order items with price snapshots
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name_snapshot: product.name,
        unit_price_snapshot: product.price,
        quantity: item.quantity,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);

      // Rollback: delete the order if items creation fails
      await supabase.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { message: "Failed to create order items" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { orderCode: order.order_code },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in order creation:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
