"use client";

import { motion } from "motion/react";
import { PackageX } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Button from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="mb-8">
            <PackageX className="w-24 h-24 text-gray-300 mx-auto" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">
            We couldn't find an order with that code. Please check your order confirmation email
            or try tracking your order.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/track">
              <Button variant="primary" size="lg">
                Track Your Order
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
