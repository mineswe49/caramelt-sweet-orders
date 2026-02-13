import { z } from "zod";
import { addDays, startOfDay } from "date-fns";
import { MIN_PREP_DAYS } from "@/lib/constants";

// Form validation schema (without items - those come from cart store)
export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.string().optional(),
  requestedPrepDate: z.string().refine(
    (date) => {
      const minDate = addDays(startOfDay(new Date()), MIN_PREP_DAYS);
      return new Date(date) >= minDate;
    },
    `Preparation date must be at least ${MIN_PREP_DAYS} days from today`
  ),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash", "manual_transfer"]),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Full validation schema (with items for API)
export const checkoutSchema = checkoutFormSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export const trackOrderSchema = z.object({
  orderCode: z.string().min(1, "Order code is required"),
  email: z.string().email("Invalid email address"),
});

export type TrackOrderFormData = z.infer<typeof trackOrderSchema>;

export const confirmPaymentSchema = z.object({
  confirmedPrepDate: z.string().refine(
    (date) => {
      const minDate = addDays(startOfDay(new Date()), MIN_PREP_DAYS);
      return new Date(date) >= minDate;
    },
    `Preparation date must be at least ${MIN_PREP_DAYS} days from today`
  ),
  adminComment: z.string().optional(),
});

export type ConfirmPaymentFormData = z.infer<typeof confirmPaymentSchema>;
