"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  hover = false,
  className = "",
}: CardProps) {
  const baseStyles =
    "bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden";
  const hoverStyles = hover
    ? "hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-shadow duration-300"
    : "";

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={`${baseStyles} ${hoverStyles} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
}
