"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { BRAND_TAGLINE } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

export function PremiumHeroSection() {
  const scrollToProducts = () => {
    document.getElementById("carousel-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/caramelt-ramdan.jpg"
          alt="Caramelt Hero Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-[family-name:var(--font-cormorant)] text-7xl sm:text-8xl md:text-9xl lg:text-10xl font-bold mb-6 tracking-tighter drop-shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 10px 30px rgba(0,0,0,0.5)",
              letterSpacing: "-0.01em",
              lineHeight: "1",
              fontStyle: "normal",
            }}
          >
            CARAMELT
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl mb-12 font-normal drop-shadow-xl tracking-widest"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.15em",
              textShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {BRAND_TAGLINE.toUpperCase()}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToProducts}
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold shadow-2xl transition-all bg-gradient-to-r from-primary to-secondary text-white hover:shadow-2xl"
          >
            Explore Our Sweets
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={scrollToProducts}
          className="p-2 rounded-full transition-colors text-white/60 hover:text-white/90"
          aria-label="Scroll to products"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={28} />
          </motion.div>
        </motion.button>
      </motion.div>
    </section>
  );
}
