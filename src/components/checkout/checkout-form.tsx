"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { CreditCard, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { checkoutFormSchema, checkoutSchema, type CheckoutFormData } from "@/lib/validators/order";
import Button from "@/components/ui/button";
import Input, { Textarea } from "@/components/ui/input";
import Card from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { addDays, format, startOfDay } from "date-fns";
import { MIN_PREP_DAYS } from "@/lib/constants";
import { useState } from "react";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, closeDrawer } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = format(addDays(startOfDay(new Date()), MIN_PREP_DAYS), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      paymentMethod: "manual_transfer",
      requestedPrepDate: minDate,
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      console.log("Submitting order:", payload);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create order");
      }

      const { orderCode } = responseData;

      // Clear cart and close drawer
      clearCart();
      closeDrawer();

      toast.success("Order placed successfully!");
      router.push(`/order-success/${orderCode}`);
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center py-16"
      >
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some delicious desserts to get started!</p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8"
    >
      {/* Checkout Form */}
      <div>
        <Card className="p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Form Validation Errors */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>• {error?.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  error={errors.email?.message}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+20 123 456 7890"
                  {...register("phone")}
                  error={errors.phone?.message}
                />
                <div>
                  <Input
                    label="WhatsApp (Optional)"
                    type="tel"
                    placeholder="+20 123 456 7890"
                    {...register("whatsapp")}
                    error={errors.whatsapp?.message}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Can be same as phone number
                  </p>
                </div>
              </div>
            </div>

            {/* Preparation Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preparation Details</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Preparation Date"
                    type="date"
                    min={minDate}
                    {...register("requestedPrepDate")}
                    error={errors.requestedPrepDate?.message}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Preparation requires at least {MIN_PREP_DAYS} days
                  </p>
                </div>
                <Textarea
                  label="Notes (Optional)"
                  placeholder="Any special instructions or requests..."
                  rows={4}
                  {...register("notes")}
                  error={errors.notes?.message}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Manual Bank Transfer */}
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    value="manual_transfer"
                    {...register("paymentMethod")}
                    className="sr-only peer"
                  />
                  <div
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedPaymentMethod === "manual_transfer"
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <CreditCard
                        className={`w-10 h-10 ${
                          selectedPaymentMethod === "manual_transfer"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Manual Bank Transfer</p>
                        <p className="text-sm text-gray-500 mt-1">Transfer to our account</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600 mt-2">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="p-6 lg:p-8 sticky top-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4">
                {item.imageUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </Card>
      </div>
    </motion.div>
  );
}
