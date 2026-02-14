"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Search, Package, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import OrderTimeline from "@/components/orders/order-timeline";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { trackOrderSchema, type TrackOrderFormData } from "@/lib/validators/order";
import { formatDate } from "@/lib/format";
import type { OrderWithItems } from "@/types/database";

export default function TrackOrderPage() {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackOrderFormData>({
    resolver: zodResolver(trackOrderSchema),
  });

  const onSubmit = async (data: TrackOrderFormData) => {
    setIsLoading(true);
    setOrder(null);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Order not found. Please check your order code and email.");
        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to track order");
        }
        return;
      }

      const orderData = await response.json();
      setOrder(orderData);
      toast.success("Order found!");
    } catch (error) {
      console.error("Track order error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to track order");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Track Your Order
              </h1>
              <p className="text-lg text-gray-600">
                Enter your order code and email to view your order status
              </p>
            </div>

            {/* Track Order Form */}
            <Card className="p-6 lg:p-8 mb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Order Code"
                    placeholder="e.g., ORD-ABC123"
                    {...register("orderCode")}
                    error={errors.orderCode?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isLoading ? "Searching..." : "Track Order"}
                </Button>
              </form>
            </Card>

            {/* Order Details */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Order Header */}
                <Card className="p-6 lg:p-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Order {order.order_code}
                    </h2>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Preparation Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-light rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Requested Prep Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(order.requested_prep_date)}
                        </p>
                      </div>
                    </div>
                    {order.confirmed_prep_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Confirmed Prep Date</p>
                          <p className="font-semibold text-green-700">
                            {formatDate(order.confirmed_prep_date)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin Comment */}
                  {order.admin_comment && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Message from Admin
                          </p>
                          <p className="text-gray-700">{order.admin_comment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Order Timeline */}
                <Card className="p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>
                  <OrderTimeline currentStatus={order.status} />
                </Card>

                {/* Order Items */}
                <Card className="p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-3 border-b">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.product_name_snapshot}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Customer Information */}
                <Card className="p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Name</p>
                      <p className="text-gray-900 font-semibold">{order.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <p className="text-gray-900 font-semibold">{order.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Phone</p>
                      <p className="text-gray-900 font-semibold">{order.phone}</p>
                    </div>
                    {order.whatsapp && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">WhatsApp</p>
                        <p className="text-gray-900 font-semibold">{order.whatsapp}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Payment Method</p>
                      <p className="text-gray-900 font-semibold">
                        {order.payment_method === "cash"
                          ? "Cash on Delivery"
                          : "Manual Bank Transfer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Payment Status</p>
                      <p className={`font-semibold ${order.is_paid ? "text-green-600" : "text-amber-600"}`}>
                        {order.is_paid ? "Paid" : "Pending"}
                      </p>
                    </div>
                    {order.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 font-medium">Notes</p>
                        <p className="text-gray-900">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
