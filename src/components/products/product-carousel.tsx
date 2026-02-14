"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/database";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  const itemsPerPage = typeof window !== "undefined" && window.innerWidth >= 1024 ? 3 : 1;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragStart(e.clientX);
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    const dragEnd = e.clientX;
    const diff = dragStart - dragEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const visibleProducts = products.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section
      id="carousel-section"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-light"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold mb-4 text-gray-900">
            Our Premium Selection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Swipe through our handcrafted desserts and order your favorites directly
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div
            ref={containerRef}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            className="overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              <AnimatePresence mode="wait">
                {visibleProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <div className="group relative h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100">
                      {/* Product Image */}
                      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-16 h-16 text-primary/30" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-6 sm:p-8">
                        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
                          {product.description || "Premium handcrafted dessert"}
                        </p>

                        {/* Rating/Reviews */}
                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">Premium Quality</span>
                        </div>

                        {/* CTA Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-3 sm:py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          Order Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          {products.length > itemsPerPage && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={isAnimating}
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={isAnimating}
                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                aria-label="Next products"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}

          {/* Dot Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-2 mt-10"
          >
            {[...Array(totalPages)].map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => !isAnimating && setCurrentIndex(idx)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? "h-3 w-8 bg-gradient-to-r from-primary to-accent"
                    : "h-3 w-3 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
