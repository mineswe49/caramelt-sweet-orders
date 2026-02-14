"use client";

import { motion } from "motion/react";
import { CheckCircle2, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import OrderTimeline from "@/components/orders/order-timeline";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import type { OrderWithItems } from "@/types/database";

interface OrderSuccessContentProps {
  order: OrderWithItems;
}

export default function OrderSuccessContent({ order }: OrderSuccessContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Success Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          className="inline-block"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"
            />
            <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 mb-4">
          Order Received!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Thank you for your order. We'll start preparing your delicious desserts soon!
        </p>

        {/* Order Code Display */}
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-8 py-4 rounded-2xl border-2 border-primary/20">
          <Package className="w-6 h-6 text-primary" />
          <div className="text-left">
            <p className="text-sm text-gray-600 font-medium">Order Code</p>
            <p className="text-2xl font-bold text-gray-900">{order.order_code}</p>
          </div>
        </div>

        {/* Requested Prep Date */}
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-700">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-medium">Requested Preparation Date:</span>
          <span className="font-bold">{formatDate(order.requested_prep_date)}</span>
        </div>
      </div>

      {/* Order Timeline */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Status</h2>
        <OrderTimeline currentStatus={order.status} />
        <p className="text-center text-gray-600 mt-6">
          We'll review your order and confirm the preparation date shortly.
        </p>
      </Card>

      {/* Order Summary */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

        <div className="space-y-4 mb-6">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.product_name_snapshot}</h4>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
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
              {order.payment_method === "cash" ? "Cash on Delivery" : "Manual Bank Transfer"}
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/track">
          <Button variant="primary" size="lg">
            Track Your Order
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
