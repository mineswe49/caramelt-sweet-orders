"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseInputProps {
  label?: string;
  error?: string;
  className?: string;
}

type InputProps = BaseInputProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaProps = BaseInputProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

export type CombinedInputProps = InputProps | TextareaProps;

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CombinedInputProps
>((props, ref) => {
  const { label, error, className = "", as = "input", ...restProps } = props;

  const baseStyles =
    "w-full px-4 py-3 rounded-xl border-2 border-neutral-light bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed";

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
      {as === "textarea" ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={combinedStyles}
          {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={combinedStyles}
          {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;

// Separate Textarea export for convenience
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Omit<TextareaProps, "as">
>((props, ref) => {
  return <Input {...props} as="textarea" ref={ref} />;
});

Textarea.displayName = "Textarea";
