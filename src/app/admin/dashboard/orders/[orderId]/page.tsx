"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OrderWithItems } from "@/types/database";
import { formatPrice, formatDate, formatShortDate } from "@/lib/format";
import { MIN_PREP_DAYS } from "@/lib/constants";
import { confirmPaymentSchema, ConfirmPaymentFormData } from "@/lib/validators/order";
import Badge, { CustomBadge } from "@/components/ui/badge";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input, { Textarea } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import OrderTimeline from "@/components/orders/order-timeline";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Check,
  DollarSign,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, startOfDay, format } from "date-fns";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);
  const [showItemEditModal, setShowItemEditModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
    reset: resetPayment,
  } = useForm({
    defaultValues: {
      adminComment: "",
    },
  });

  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    formState: { errors: customerErrors },
    reset: resetCustomer,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      notes: "",
    },
  });

  const {
    register: registerItem,
    handleSubmit: handleItemSubmit,
    formState: { errors: itemErrors },
    reset: resetItem,
    watch: watchItem,
  } = useForm({
    defaultValues: {
      quantity: 1,
      unitPrice: 0,
    },
  });

  const {
    register: registerAccept,
    handleSubmit: handleAcceptSubmit,
    formState: { errors: acceptErrors },
    reset: resetAccept,
  } = useForm({
    defaultValues: {
      confirmedPrepDate: "",
    },
  });

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);

      // Set default values for payment modal
      if (data) {
        const defaultDate = data.requested_prep_date || format(addDays(startOfDay(new Date()), MIN_PREP_DAYS), "yyyy-MM-dd");
        reset({
          confirmedPrepDate: defaultDate,
          adminComment: "",
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = () => {
    if (order) {
      resetCustomer({
        fullName: order.full_name,
        email: order.email,
        phone: order.phone,
        whatsapp: order.whatsapp || "",
        notes: order.notes || "",
      });
      setShowCustomerEditModal(true);
    }
  };

  const handleUpdateCustomer = async (data: any) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp || null,
          notes: data.notes || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update customer");

      toast.success("Customer details updated successfully");
      setShowCustomerEditModal(false);
      fetchOrder();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditItem = (itemId: string) => {
    const item = order?.order_items.find((i) => i.id === itemId);
    if (item) {
      setSelectedItemId(itemId);
      resetItem({
        quantity: item.quantity,
        unitPrice: item.unit_price_snapshot,
      });
      setShowItemEditModal(true);
    }
  };

  const handleUpdateItem = async (data: any) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/orders/${orderId}/items`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: selectedItemId,
            quantity: parseInt(data.quantity),
            unitPrice: parseFloat(data.unitPrice),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update item");

      toast.success("Order item updated successfully");
      setShowItemEditModal(false);
      setSelectedItemId(null);
      fetchOrder();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update order item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/orders/${orderId}/items?itemId=${itemId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete item");

      toast.success("Order item removed successfully");
      fetchOrder();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to remove order item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel order");

      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      fetchOrder();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleOpenAcceptModal = () => {
    if (order) {
      resetAccept({
        confirmedPrepDate: order.requested_prep_date || format(addDays(startOfDay(new Date()), MIN_PREP_DAYS), "yyyy-MM-dd"),
      });
      setShowAcceptModal(true);
    }
  };

  const handleAcceptOrder = async (data: any) => {
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({
          status: "ACCEPTED",
          confirmed_prep_date: data.confirmedPrepDate,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order accepted successfully");
      setShowAcceptModal(false);
      fetchOrder();
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async (data: any) => {
    setActionLoading(true);
    try {
      const supabase = createClient();

      // Update order
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "PAID_CONFIRMED",
          is_paid: true,
          paid_at: new Date().toISOString(),
          admin_comment: data.adminComment || null,
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Invoke edge function to send email
      try {
        const { error: emailError } = await supabase.functions.invoke(
          "send-payment-confirmation",
          {
            body: { orderId },
          }
        );

        if (emailError) {
          console.error("Email sending error:", emailError);
          toast.warning("Order marked as paid but email notification failed");
        }
      } catch (emailErr) {
        console.error("Email function error:", emailErr);
      }

      toast.success("Order marked as paid successfully");
      setShowPaymentModal(false);
      fetchOrder();
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast.error("Failed to mark order as paid");
    } finally {
      setActionLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!order) return 0;
    return order.order_items.reduce((sum, item) => sum + item.line_total, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Button onClick={() => router.push("/admin/dashboard")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const minPrepDate = format(addDays(startOfDay(new Date()), MIN_PREP_DAYS), "yyyy-MM-dd");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Orders</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order {order.order_code}
            </h1>
            <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
          </div>
          <Badge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
              <button
                onClick={handleEditCustomer}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{order.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{order.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
              </div>
              {order.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-medium text-gray-900">{order.whatsapp}</p>
                  </div>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium text-gray-900">{order.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-2 text-gray-900 font-medium">
                        {item.product_name_snapshot}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-900">
                        {formatPrice(item.unit_price_snapshot)}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-900">
                        {formatPrice(item.line_total)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="py-3 px-2 text-right font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-lg text-primary">
                      {formatPrice(calculateTotal())}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preparation Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Requested Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(order.requested_prep_date)}
                  </p>
                </div>
              </div>
              {order.confirmed_prep_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Confirmed Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.confirmed_prep_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
            <OrderTimeline currentStatus={order.status} />
          </Card>
        </div>

        {/* Right Column - Admin Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Actions</h2>

              <div className="space-y-4">
                {order.status === "PENDING_ADMIN_ACCEPTANCE" && (
                  <Button
                    onClick={handleOpenAcceptModal}
                    loading={actionLoading}
                    variant="primary"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Accept Order
                  </Button>
                )}

                {order.status === "ACCEPTED" && (
                  <Button
                    onClick={() => {
                      resetPayment({ adminComment: "" });
                      setShowPaymentModal(true);
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Mark as Paid
                  </Button>
                )}

                {order.status === "PAID_CONFIRMED" && (
                  <div className="space-y-3">
                    <CustomBadge variant="success" className="w-full justify-center text-sm py-2">
                      Payment Confirmed
                    </CustomBadge>
                    {order.paid_at && (
                      <p className="text-sm text-gray-600 text-center">
                        Confirmed on {formatDate(order.paid_at)}
                      </p>
                    )}
                    {order.admin_comment && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Admin Comment</p>
                        <p className="text-sm text-blue-800">{order.admin_comment}</p>
                      </div>
                    )}
                  </div>
                )}

                {order.status === "CANCELLED" && (
                  <CustomBadge variant="error" className="w-full justify-center text-sm py-2">
                    Order Cancelled
                  </CustomBadge>
                )}

                {order.status !== "CANCELLED" && (
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    variant="secondary"
                    size="lg"
                    className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 mt-4"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {order.payment_method.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${order.is_paid ? "text-green-600" : "text-amber-600"}`}>
                    {order.is_paid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Accept Order Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept Order"
      >
        <form onSubmit={handleAcceptSubmit(handleAcceptOrder)} className="space-y-4">
          <Input
            type="date"
            label="Confirmed Preparation Date"
            min={minPrepDate}
            error={acceptErrors.confirmedPrepDate?.message}
            {...registerAccept("confirmedPrepDate")}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAcceptModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              className="flex-1"
            >
              Accept Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mark as Paid Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Mark Order as Paid"
      >
        <form onSubmit={handlePaymentSubmit(handleMarkAsPaid)} className="space-y-4">
          <Textarea
            label="Admin Comment (Optional)"
            placeholder="Add any notes about the payment..."
            rows={3}
            error={paymentErrors.adminComment?.message}
            {...registerPayment("adminComment")}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              className="flex-1"
            >
              Mark as Paid & Send Email
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Edit Modal */}
      <Modal
        isOpen={showCustomerEditModal}
        onClose={() => setShowCustomerEditModal(false)}
        title="Edit Customer Information"
      >
        <form onSubmit={handleCustomerSubmit(handleUpdateCustomer)} className="space-y-4">
          <Input
            label="Full Name"
            error={customerErrors.fullName?.message}
            {...registerCustomer("fullName")}
          />

          <Input
            type="email"
            label="Email"
            error={customerErrors.email?.message}
            {...registerCustomer("email")}
          />

          <Input
            type="tel"
            label="Phone"
            error={customerErrors.phone?.message}
            {...registerCustomer("phone")}
          />

          <Input
            type="tel"
            label="WhatsApp (Optional)"
            error={customerErrors.whatsapp?.message}
            {...registerCustomer("whatsapp")}
          />

          <Textarea
            label="Order Notes (Optional)"
            placeholder="Add any special instructions or notes..."
            rows={3}
            error={customerErrors.notes?.message}
            {...registerCustomer("notes")}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCustomerEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Edit Modal */}
      <Modal
        isOpen={showItemEditModal}
        onClose={() => setShowItemEditModal(false)}
        title="Edit Order Item"
      >
        <form onSubmit={handleItemSubmit(handleUpdateItem)} className="space-y-4">
          <Input
            type="number"
            label="Quantity"
            min="1"
            error={itemErrors.quantity?.message}
            {...registerItem("quantity")}
          />

          <Input
            type="number"
            label="Unit Price"
            step="0.01"
            min="0"
            error={itemErrors.unitPrice?.message}
            {...registerItem("unitPrice")}
          />

          {watchItem("quantity") && watchItem("unitPrice") && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Line Total: <span className="font-semibold text-gray-900">
                  {formatPrice(watchItem("quantity") * watchItem("unitPrice"))}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowItemEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              className="flex-1"
            >
              Update Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Are you sure?</p>
              <p className="text-sm text-red-800 mt-1">
                This will mark the order as cancelled. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCancelOrder}
              loading={actionLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
