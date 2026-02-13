"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OrderWithItems, OrderStatus } from "@/types/database";
import { formatPrice, formatShortDate } from "@/lib/format";
import Badge from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { motion } from "motion/react";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Package,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  upcomingDeliveries: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    upcomingDeliveries: 0,
  });
  const [latestOrders, setLatestOrders] = useState<OrderWithItems[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch all orders
      const { data: allOrders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const orders = (allOrders || []) as OrderWithItems[];

      // Calculate stats - count all paid/completed orders including delivered statuses
      const totalRevenue = orders
        .filter(
          (order) =>
            order.status === "PAID_CONFIRMED" ||
            order.status === "ACCEPTED" ||
            order.status === "DELIVERED" ||
            order.status === "NOT_DELIVERED" ||
            order.status === "RETURNED"
        )
        .reduce((sum, order) => {
          return (
            sum +
            order.order_items.reduce((itemSum, item) => itemSum + item.line_total, 0)
          );
        }, 0);

      const pendingOrders = orders.filter(
        (o) => o.status === "PENDING_ADMIN_ACCEPTANCE"
      ).length;

      // Get latest 10 orders
      const latest10 = orders.slice(0, 10);

      // Get upcoming deliveries (next 2 weeks from today) - orders that haven't been delivered/returned/cancelled
      const today = new Date();
      const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

      const upcoming = orders
        .filter((order) => {
          const prepDate = new Date(
            order.confirmed_prep_date || order.requested_prep_date
          );
          const isNotFinal =
            order.status !== "CANCELLED" &&
            order.status !== "DELIVERED" &&
            order.status !== "NOT_DELIVERED" &&
            order.status !== "RETURNED";

          return (
            isNotFinal &&
            prepDate >= today &&
            prepDate <= twoWeeksLater
          );
        })
        .sort(
          (a, b) =>
            new Date(a.confirmed_prep_date || a.requested_prep_date).getTime() -
            new Date(b.confirmed_prep_date || b.requested_prep_date).getTime()
        )
        .slice(0, 10);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        upcomingDeliveries: upcoming.length,
      });

      setLatestOrders(latest10);
      setUpcomingOrders(upcoming);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateTotal = (items: OrderWithItems["order_items"]) => {
    return items.reduce((sum, item) => sum + item.line_total, 0);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_ADMIN_ACCEPTANCE":
        return "bg-amber-50 border-amber-200";
      case "ACCEPTED":
        return "bg-blue-50 border-blue-200";
      case "PAID_CONFIRMED":
        return "bg-green-50 border-green-200";
      case "CANCELLED":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getDaysUntilDelivery = (prepDate: string) => {
    const today = new Date();
    const deliveryDate = new Date(prepDate);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your order overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pendingOrders}
                </p>
              </div>
              <Clock className="w-12 h-12 text-amber-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Upcoming Deliveries
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.upcomingDeliveries}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Upcoming Deliveries - Most Important */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden border-2 border-primary shadow-lg">
            <div className="px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Upcoming Deliveries</h2>
              </div>
              <p className="text-sm opacity-90">Next 2 weeks</p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : upcomingOrders.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">All clear!</p>
                <p className="text-sm text-gray-500">
                  No deliveries in the next 2 weeks
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-6">
                {upcomingOrders.map((order, index) => {
                  const daysUntil = getDaysUntilDelivery(
                    order.confirmed_prep_date || order.requested_prep_date
                  );
                  const isUrgent = daysUntil <= 3;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      onClick={() =>
                        router.push(`/admin/dashboard/orders/${order.id}`)
                      }
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        isUrgent
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white hover:border-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono font-semibold text-primary text-sm">
                          {order.order_code}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            isUrgent
                              ? "bg-red-200 text-red-800"
                              : "bg-blue-200 text-blue-800"
                          }`}
                        >
                          {daysUntil} {daysUntil === 1 ? "day" : "days"}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {order.full_name}
                      </p>

                      <div className="text-xs text-gray-600 mb-2">
                        <p>
                          📅{" "}
                          {formatShortDate(
                            order.confirmed_prep_date ||
                              order.requested_prep_date
                          )}
                        </p>
                        <p>💰 {formatPrice(calculateTotal(order.order_items))}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <Badge status={order.status} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Latest Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Latest Orders
              </h2>
              <button
                onClick={() => router.push("/admin/dashboard/all-orders")}
                className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : latestOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {latestOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        onClick={() =>
                          router.push(`/admin/dashboard/orders/${order.id}`)
                        }
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-primary">
                            {order.order_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.full_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {formatPrice(calculateTotal(order.order_items))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={order.status} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
