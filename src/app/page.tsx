import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { EnhancedHeader } from "@/components/layout/enhanced-header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { ProductCarousel } from "@/components/products/product-carousel";
import { PremiumHeroSection } from "@/components/premium-hero-section";

export default async function Home() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen flex flex-col">
      <EnhancedHeader />
      <CartDrawer />
      <main className="flex-1">
        <PremiumHeroSection />
        <ProductCarousel products={(products as Product[]) || []} />
      </main>
      <Footer />
    </div>
  );
}
