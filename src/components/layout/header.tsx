"use client";

import { ShoppingBag } from "lucide-react";
import { motion, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";

export function Header() {
  const { getTotalItems, openDrawer } = useCartStore();
  const totalItems = getTotalItems();
  const [prevItemCount, setPrevItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Track scroll position
  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 10);
    });
  }, [scrollY]);

  // Detect item count changes for pulse animation
  useEffect(() => {
    if (totalItems > prevItemCount) {
      setPrevItemCount(totalItems);
    }
  }, [totalItems, prevItemCount]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
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
            <span className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Cart Button */}
          <motion.button
            onClick={openDrawer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-shadow"
            aria-label={`Shopping cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline font-medium">Cart</span>

            {/* Item Count Badge */}
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-accent text-white text-xs font-bold rounded-full shadow-md"
              >
                <motion.span
                  animate={{
                    scale: totalItems > prevItemCount ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {totalItems}
                </motion.span>
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
