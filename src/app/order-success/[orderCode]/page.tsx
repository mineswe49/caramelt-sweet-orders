import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import OrderSuccessContent from "@/components/orders/order-success-content";
import { notFound } from "next/navigation";
import type { OrderWithItems } from "@/types/database";

interface OrderSuccessPageProps {
  params: Promise<{ orderCode: string }>;
}

async function getOrder(orderCode: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq("order_code", orderCode)
    .single();

  if (error || !order) {
    return null;
  }

  return order as OrderWithItems;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderCode } = await params;
  const order = await getOrder(orderCode);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <OrderSuccessContent order={order} />
      </main>
      <Footer />
    </div>
  );
}
