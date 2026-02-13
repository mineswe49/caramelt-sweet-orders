import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { ProductList } from "@/components/products/product-list";
import { HeroSection } from "@/components/hero-section";

export default async function Home() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <HeroSection />
        <section id="products" className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Signature Desserts
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Each dessert is handcrafted with premium ingredients and a whole lot of love.
            </p>
          </div>
          <ProductList products={(products as Product[]) || []} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
