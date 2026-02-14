"use client";

import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Product } from "@/types/database";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import Button from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
    });

    toast.success("Added to cart!", {
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          /* Gradient Placeholder */
          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20 flex items-center justify-center">
            <ShoppingBag className="w-20 h-20 text-white/50" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 space-y-3">
        {/* Name */}
        <h3 className="font-display text-xl font-bold text-gray-900 line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
          {product.description || "A delicious handcrafted dessert."}
        </p>

        {/* Price */}
        <div className="pt-2">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Add to Cart Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleAddToCart}
            variant="primary"
            size="md"
            className="w-full"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </motion.div>
      </div>
    </motion.article>
  );
}
