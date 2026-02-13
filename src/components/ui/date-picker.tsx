"use client";

import { forwardRef, InputHTMLAttributes } from "react";

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  minDate?: string; // yyyy-mm-dd format
  className?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    { label, error, helperText, minDate, className = "", ...props },
    ref
  ) => {
    const baseStyles =
      "w-full px-4 py-3 rounded-xl border-2 border-neutral-light bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed";

    const errorStyles = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "";

    const combinedStyles = `${baseStyles} ${errorStyles} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          min={minDate}
          className={combinedStyles}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
