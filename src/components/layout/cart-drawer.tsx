"use client";

import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import QuantitySelector from "@/components/ui/quantity-selector";
import Button from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
  } = useCartStore();

  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral/20">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Your Cart
              </h2>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-neutral-light transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-6 text-center"
                >
                  <div className="relative w-32 h-32 opacity-20">
                    <ShoppingBag className="w-full h-full text-neutral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500">
                      Add some delicious desserts to get started!
                    </p>
                  </div>
                  <Button onClick={closeDrawer} variant="primary">
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                /* Cart Items List */
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 rounded-2xl bg-neutral-light/50 hover:bg-neutral-light transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-primary/40" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-primary font-bold mt-1">
                          {formatPrice(item.price)}
                          <span className="text-gray-500 font-normal">
                            {" "}
                            / each
                          </span>
                        </p>

                        {/* Quantity Selector & Remove */}
                        <div className="flex items-center justify-between mt-3">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQuantity) =>
                              updateQuantity(item.productId, newQuantity)
                            }
                            minOne={false}
                            className="scale-90 origin-left"
                          />

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <p className="text-right text-lg font-bold text-gray-900 mt-2">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Subtotal and Checkout */}
            {items.length > 0 && (
              <div className="border-t border-neutral/20 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-700">Subtotal</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeDrawer} className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-xs text-center text-gray-500">
                  Payment and delivery details will be collected at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
