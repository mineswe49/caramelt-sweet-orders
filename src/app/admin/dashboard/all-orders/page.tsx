"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OrderWithItems, OrderStatus } from "@/types/database";
import { formatPrice, formatShortDate } from "@/lib/format";
import Badge from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { motion } from "motion/react";
import { Package, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import AddOrderModal from "@/components/admin/add-order-modal";

type FilterStatus = "ALL" | OrderStatus;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const itemsPerPage = 15;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false });

      // Apply filter if not ALL
      if (filter !== "ALL") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders();
  }, [filter]);

  const handleOrderAdded = () => {
    fetchOrders();
    setIsAddOrderModalOpen(false);
  };

  const calculateTotal = (items: OrderWithItems["order_items"]) => {
    return items.reduce((sum, item) => sum + item.line_total, 0);
  };

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING_ADMIN_ACCEPTANCE" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Paid", value: "PAID_CONFIRMED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Not Delivered", value: "NOT_DELIVERED" },
    { label: "Returned", value: "RETURNED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  // Filter by status and search query
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filter === "ALL" || order.status === filter;
    const query = searchQuery.toLowerCase().trim();

    if (!query) return matchesStatus;

    const matchesSearch =
      order.full_name?.toLowerCase().includes(query) ||
      order.email?.toLowerCase().includes(query) ||
      order.phone?.toLowerCase().includes(query) ||
      order.whatsapp?.toLowerCase().includes(query) ||
      order.order_code?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const filteredCount = filteredOrders.length;

  const getStats = () => {
    return {
      ordered: orders.filter((o) => o.status === "PENDING_ADMIN_ACCEPTANCE").length,
      accepted: orders.filter((o) => o.status === "ACCEPTED").length,
      paid: orders.filter((o) => o.status === "PAID_CONFIRMED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto">
      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onClose={() => setIsAddOrderModalOpen(false)}
        onOrderAdded={handleOrderAdded}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Orders</h1>
          </div>
          <button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Order
          </button>
        </div>
        <p className="text-gray-600">
          {filteredCount} {filteredCount === 1 ? "order" : "orders"} {filter !== "ALL" && `(${filters.find(f => f.value === filter)?.label})`}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-600 font-medium">Ordered</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.ordered}</p>
          <p className="text-xs text-gray-500 mt-1">Pending acceptance</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-600 font-medium">Accepted</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.accepted}</p>
          <p className="text-xs text-gray-500 mt-1">Ready to mark as paid</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-600 font-medium">Paid</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.paid}</p>
          <p className="text-xs text-gray-500 mt-1">Payment confirmed</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-600 font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelled}</p>
          <p className="text-xs text-gray-500 mt-1">Cancelled orders</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or WhatsApp..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              filter === f.value
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? "No orders match your search criteria."
                : filter !== "ALL"
                  ? `No ${filters.find(f => f.value === filter)?.label.toLowerCase()} orders yet.`
                  : "No orders have been placed yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Prep Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => router.push(`/admin/dashboard/orders/${order.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-primary">
                          {order.order_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.full_name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatShortDate(order.confirmed_prep_date || order.requested_prep_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(calculateTotal(order.order_items))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatShortDate(order.created_at)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
