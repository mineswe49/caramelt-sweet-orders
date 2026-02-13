"use client";

import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import CheckoutForm from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-2">
              Checkout
            </h1>
            <p className="text-gray-600 text-center">
              Complete your order and get ready for delicious desserts!
            </p>
          </div>

          <CheckoutForm />
        </motion.div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
