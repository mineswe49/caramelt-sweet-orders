"use client";

import { Heart } from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-light border-t border-neutral/20 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Brand Name */}
          <h3 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {BRAND_NAME}
          </h3>

          {/* Tagline */}
          <p className="text-neutral-dark text-sm sm:text-base italic max-w-md">
            {BRAND_TAGLINE}
          </p>

          {/* Handcrafted Text */}
          <div className="flex items-center gap-2 text-neutral-dark text-sm">
            <span>Handcrafted with love</span>
            <Heart className="w-4 h-4 text-deep fill-deep" />
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-neutral/30 my-2" />

          {/* Copyright */}
          <p className="text-neutral-dark text-xs sm:text-sm">
            &copy; {currentYear} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
