"use client";

import { ShoppingBag } from "lucide-react";
import { motion, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";

export function EnhancedHeader() {
  const { getTotalItems, openDrawer } = useCartStore();
  const totalItems = getTotalItems();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 10);
    });
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 bg-gradient-to-r from-white via-white to-white ${
        isScrolled ? "shadow-xl shadow-primary/10" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group flex-shrink-0"
            aria-label="Caramelt Home"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-200 group-hover:scale-110">
              <Image
                src="/caramelt-logo.png"
                alt="Caramelt Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right Section - Track Order & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Order Link */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/track"
                className="flex items-center gap-2 px-3 py-2.5 rounded-full text-gray-700 hover:text-primary transition-colors font-medium text-xs sm:text-sm border border-gray-200 hover:border-primary"
              >
                Track Order
              </Link>
            </motion.div>

            {/* Cart Button */}
            <motion.button
              onClick={openDrawer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-secondary"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline font-medium text-sm">Cart</span>

            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-accent text-white text-xs font-bold rounded-full shadow-md"
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
