"use client";

import { Minus, Plus } from "lucide-react";

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  minOne?: boolean;
  max?: number;
  className?: string;
}

export default function QuantitySelector({
  value,
  onChange,
  minOne = false,
  max,
  className = "",
}: QuantitySelectorProps) {
  const minValue = minOne ? 1 : 0;

  const handleDecrement = () => {
    if (value > minValue) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  const canDecrement = value > minValue;
  const canIncrement = max === undefined || value < max;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${
          canDecrement
            ? "border-primary text-primary hover:bg-primary hover:text-white active:scale-95"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        }`}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>

      <span className="w-10 text-center font-semibold text-lg text-gray-900">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${
          canIncrement
            ? "border-primary text-primary hover:bg-primary hover:text-white active:scale-95"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        }`}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
